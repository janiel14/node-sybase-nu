const SyBase = require("../dist/node_sybase");

const sybase = new SyBase([
    {
        name: "main",
        host: "localhost",
        port: 2638,
        dbname: "contabil",
        username: "NUCONTBI",
        password: "123456",
        logging: true,
        encoding: "iso_1"
    }
]);

const init = async () => {
    try {
        const rs = await sybase.DBPools.main.query(
            "SELECT TOP 1 START AT 1 * FROM bethadba.geempre"
        );
        console.log(rs[0]);
    } catch (error) {
        console.error("error fatal: ", error);
    }
};

init();
