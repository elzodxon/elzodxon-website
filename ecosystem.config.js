module.exports = {
    apps: [
        {
            name: "Elzodxon Website",
            port: 5000,
            exec_mode: "cluster",
            instances: "1",
            script: "./.output/server/index.mjs",
            args: "preview",
        },
    ],
};
