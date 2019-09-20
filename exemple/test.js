const SyBase = require("../dist/node_sybase");

const sybase = new SyBase([
    {
        name: "main",
        host: "localhost",
        port: 2638,
        dbname: "contabil",
        username: "NUCONTBI",
        password: "123456"
    }
]);

const init = async () => {
    try {
        await sybase.DBPools.main.connect();
        const rs = await sybase.DBPools.main.query(
            "SELECT TOP 1 START AT 1 * FROM bethadba.geempre"
        );
        console.log(rs[0]);
        await sybase.DBPools.main.disconnect();
    } catch (error) {
        console.error("error fatal: ", error);
    }
};

init();
