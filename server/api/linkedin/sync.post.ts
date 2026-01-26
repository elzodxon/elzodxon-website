import { promises as fs } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

interface LinkedInPost {
  id: string;
  text: string;
  date: string;
  link: string;
  image: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

const DATA_FILE = join(process.cwd(), 'server/data/linkedin-posts.json');

// Fallback session cookie (update this if needed)
const FALLBACK_SESSION_COOKIE = 'AQEDAS03E1EC1mK9AAABmiuwzFkAAAGb_nE42k0Ao1FRPNmhtPt2ttM-i8MLZjlCx4FsTkzyy_K6YzAKSuHaybSY3B5Anh6rEl_nkG7QwYpQQUkq2Hv7mGzTg_a6Xj5oiDD9qxt3mdBG0GGRc_NPUnfw';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const profileUsername = config.linkedinProfile || 'elzodxon';
  const sessionCookie = config.linkedinSessionCookie || FALLBACK_SESSION_COOKIE;
  
  // Get query params - how many posts to fetch (default 10, max 50)
  const query = getQuery(event);
  const postsToFetch = Math.min(50, Math.max(1, Number(query.posts) || 10));

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode for better compatibility
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--enable-features=NetworkService,NetworkServiceInProcess',
      ],
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    
    // Hide webdriver property to avoid detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    
    // Set session cookie if provided
    if (sessionCookie) {
      console.log('Setting LinkedIn session cookie...');
      await page.setCookie({
        name: 'li_at',
        value: sessionCookie,
        domain: '.linkedin.com',
        path: '/',
        httpOnly: true,
        secure: true,
      });
    }

    // Try activity page first, fallback to main profile if needed
    let url = `https://www.linkedin.com/in/${profileUsername}/recent-activity/all/`;
    console.log(`Navigating to: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    } catch (error) {
      // If activity page fails, try main profile page
      console.log('Activity page failed, trying main profile page...');
      url = `https://www.linkedin.com/in/${profileUsername}/`;
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    }
    
    // Check if we're on a login page or blocked
    const currentUrl = page.url();
    const pageTitle = await page.title();
    
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Page title: ${pageTitle}`);
    
    if (currentUrl.includes('/login') || currentUrl.includes('/checkpoint') || pageTitle.toLowerCase().includes('sign in')) {
      await browser.close();
      throw new Error('LinkedIn requires authentication. Please provide LINKEDIN_SESSION_COOKIE in your environment variables.');
    }
    
    // Wait for the page to fully load - LinkedIn is a SPA and needs time
    console.log('Waiting for content to load...');
    
    // Wait for body text to grow (content loading)
    let attempts = 0;
    let bodyTextLength = 0;
    while (attempts < 15) {
      bodyTextLength = await page.evaluate(() => document.body.innerText.length);
      console.log(`Content length check ${attempts + 1}: ${bodyTextLength} chars`);
      
      if (bodyTextLength > 2000) {
        console.log('Content appears loaded');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    // Debug: Get page structure info
    const pageDebugInfo = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const classes = new Set<string>();
      allElements.forEach(el => {
        el.classList.forEach(c => classes.add(c));
      });
      
      // Find likely post containers
      const possiblePostContainers = [
        'article', 'div[class*="update"]', 'div[class*="post"]', 'div[class*="feed"]',
        'li[class*="update"]', 'section[class*="update"]', 'div[class*="activity"]'
      ];
      
      const foundContainers: { selector: string; count: number }[] = [];
      possiblePostContainers.forEach(selector => {
        try {
          const count = document.querySelectorAll(selector).length;
          if (count > 0) {
            foundContainers.push({ selector, count });
          }
        } catch {}
      });
      
      return {
        bodyTextLength: document.body.innerText.length,
        hasMain: !!document.querySelector('main'),
        hasScaffold: !!document.querySelector('.scaffold-layout'),
        foundContainers,
        sampleClasses: Array.from(classes).slice(0, 50),
      };
    });
    
    console.log('Page debug info:', JSON.stringify(pageDebugInfo, null, 2));
    
    // Try multiple selectors for posts - expanded list
    const postSelectors = [
      'article[data-activity-id]',
      'article.occludable-update',
      'div.feed-shared-update-v2',
      'section.feed-update',
      'div[class*="occludable-update"]',
      'div[data-urn]',
      'li.profile-creator-shared-feed-update__container',
      'div.profile-creator-shared-feed-update__container',
      'article',
    ];
    
    let foundPosts = false;
    let foundSelector = '';
    for (const selector of postSelectors) {
      try {
        const count = await page.$$eval(selector, els => els.length);
        if (count > 0) {
          foundPosts = true;
          foundSelector = selector;
          console.log(`Found ${count} elements using selector: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }
    
    if (!foundPosts) {
      // Check what's actually on the page
      const hasMainContent = await page.evaluate(() => {
        return document.querySelector('main') !== null || 
               document.querySelector('.scaffold-layout') !== null ||
               document.querySelector('body').innerText.length > 100;
      });
      
      await browser.close();
      
      if (!hasMainContent) {
        throw new Error('Page did not load properly. The profile may be private or require authentication.');
      }
      
      throw new Error(`No posts found. Debug info: ${JSON.stringify(pageDebugInfo)}. The page structure may have changed or the profile has no recent activity.`);
    }

    // Scroll to load more posts
    let previousPostCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5;

    while (scrollAttempts < maxScrollAttempts) {
      // Try multiple selectors to count posts
      const currentPostCount = await page.evaluate(() => {
        const selectors = [
          'article[data-activity-id]',
          'article.occludable-update',
          'div.feed-shared-update-v2',
        ];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            return elements.length;
          }
        }
        return 0;
      });
      
      console.log(`Found ${currentPostCount} posts after scroll attempt ${scrollAttempts + 1}`);
      
      if (currentPostCount >= postsToFetch || currentPostCount === previousPostCount) {
        break;
      }
      
      previousPostCount = currentPostCount;
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      scrollAttempts++;
    }

    // Extract posts with multiple selector strategies
    const posts = await page.evaluate((profileUsername) => {
      // Try multiple selectors to find posts
      const selectors = [
        'article[data-activity-id]',
        'article.occludable-update',
        'div.feed-shared-update-v2',
      ];
      
      let articles: Element[] = [];
      for (const selector of selectors) {
        const found = Array.from(document.querySelectorAll(selector));
        if (found.length > 0) {
          articles = found;
          break;
        }
      }
      
      const extractedPosts: LinkedInPost[] = [];
      const seenIds = new Set<string>();

      articles.forEach((article) => {
        // Try to get activity ID from multiple sources
        const activityId = 
          article.getAttribute('data-activity-id') ||
          article.getAttribute('data-urn')?.split(':').pop() ||
          article.querySelector('[data-activity-id]')?.getAttribute('data-activity-id') ||
          `post-${extractedPosts.length}`;
          
        if (seenIds.has(activityId)) return;
        seenIds.add(activityId);

        // Extract post text - try multiple selectors
        const textSelectors = [
          '.feed-shared-update-v2__description',
          '.feed-shared-text__text-view',
          '.feed-shared-text',
          '.update-components-text',
          'span[dir="ltr"]',
        ];
        
        let text = '';
        for (const selector of textSelectors) {
          const textElement = article.querySelector(selector);
          if (textElement) {
            text = textElement.textContent?.trim() || '';
            if (text) break;
          }
        }

        // Extract date - try multiple selectors
        const dateSelectors = [
          'time[datetime]',
          'time',
          '[data-test-id="timestamp"]',
        ];
        
        let dateStr = new Date().toISOString();
        for (const selector of dateSelectors) {
          const timeElement = article.querySelector(selector);
          if (timeElement) {
            dateStr = timeElement.getAttribute('datetime') || 
                     timeElement.getAttribute('title') ||
                     timeElement.textContent?.trim() ||
                     new Date().toISOString();
            if (dateStr && dateStr !== new Date().toISOString()) break;
          }
        }

        // Extract engagement metrics - try multiple approaches
        let likes = null;
        let comments = null;
        let shares = null;

        // Try to find social actions container
        const socialActions = article.querySelector('.social-actions, .social-actions-button, .feed-shared-social-action-bar');
        
        if (socialActions) {
          // Try aria-labels
          const buttons = socialActions.querySelectorAll('button');
          buttons.forEach(button => {
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            const text = button.textContent?.toLowerCase() || '';
            
            if (ariaLabel.includes('like') || text.includes('like')) {
              const match = (ariaLabel + ' ' + text).match(/(\d+)/);
              if (match) likes = parseInt(match[1], 10);
            }
            if (ariaLabel.includes('comment') || text.includes('comment')) {
              const match = (ariaLabel + ' ' + text).match(/(\d+)/);
              if (match) comments = parseInt(match[1], 10);
            }
            if (ariaLabel.includes('share') || text.includes('share')) {
              const match = (ariaLabel + ' ' + text).match(/(\d+)/);
              if (match) shares = parseInt(match[1], 10);
            }
          });
        }

        // Extract image - try multiple selectors
        const imageSelectors = [
          '.feed-shared-image img',
          '.feed-shared-video img',
          'img[src*="media"]',
          'img[alt*="post"]',
        ];
        
        let image = null;
        for (const selector of imageSelectors) {
          const imageElement = article.querySelector(selector);
          if (imageElement) {
            image = imageElement.getAttribute('src') || imageElement.getAttribute('data-src');
            if (image) break;
          }
        }

        // Extract post link - try multiple selectors
        const linkSelectors = [
          'a[href*="/activity-"]',
          'a[href*="/posts/"]',
          'a[data-control-name="update"]',
        ];
        
        let link = '';
        for (const selector of linkSelectors) {
          const linkElement = article.querySelector(selector);
          if (linkElement) {
            const relativeLink = linkElement.getAttribute('href') || '';
            link = relativeLink.startsWith('http') 
              ? relativeLink 
              : `https://www.linkedin.com${relativeLink}`;
            if (link) break;
          }
        }
        
        // If no link found, construct one from activity ID
        if (!link && activityId && activityId.startsWith('urn:')) {
          link = `https://www.linkedin.com/feed/update/${activityId.split(':').pop()}`;
        }

        // Only add if we have some content
        if (text || image || link) {
          extractedPosts.push({
            id: activityId,
            text,
            date: dateStr,
            link: link || `https://www.linkedin.com/in/${profileUsername}`,
            image,
            likes,
            comments,
            shares,
          });
        }
      });

      return extractedPosts;
    }, profileUsername);
    
    console.log(`Extracted ${posts.length} posts from page`);

    await browser.close();

    if (posts.length === 0) {
      throw new Error('No posts found. Possible reasons: 1) LinkedIn requires authentication (set LINKEDIN_SESSION_COOKIE), 2) Profile has no recent activity, 3) Page structure changed. Check the console logs for more details.');
    }

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'server/data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Load existing posts to merge
    let existingPosts: LinkedInPost[] = [];
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf-8');
      existingPosts = JSON.parse(existingData);
    } catch {
      // File doesn't exist yet
    }

    // Merge posts - use a Map to deduplicate by ID
    const postMap = new Map<string, LinkedInPost>();
    
    // Add existing posts first
    for (const post of existingPosts) {
      postMap.set(post.id, post);
    }
    
    // Add/update with new posts
    for (const post of posts) {
      postMap.set(post.id, post);
    }

    // Convert back to array and sort by date (newest first)
    const mergedPosts = Array.from(postMap.values());
    mergedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Save to file
    await fs.writeFile(DATA_FILE, JSON.stringify(mergedPosts, null, 2));

    return {
      success: true,
      message: `Fetched ${posts.length} posts. Total: ${mergedPosts.length} posts`,
      newPosts: posts.length,
      totalPosts: mergedPosts.length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to sync LinkedIn posts: ${error.message}`,
    });
  }
});
