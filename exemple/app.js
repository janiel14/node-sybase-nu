const SyBase = require("./db");
SyBase.use(__dirname + "/models");

const CRUD = () => {
    SyBase.DBPools.main.client.connect((error) => {
        if (error) {
            console.error("error: ", error);
        } else {
            if (SyBase.DBPools.main.client.connected) {
                SyBase.models.WXUser.by(SyBase.DBPools.main)
                    .create(
                        {
                            id: 12345678,
                            openid: "test Openid",
                            phone: "11",
                            headurl: "http://www.baidu.com/favicon",
                            cardno: "90000011",
                            wxname: 110
                        },
                        true
                    )
                    .then((res) => {
                        console.info("------- Created ", res);
                        return SyBase.models.WXUser.findByID(res.id);
                    })
                    .then((res) => {
                        console.info("------- Find BY ID : ", res);
                        return SyBase.models.WXUser.findOne({ id: res.id });
                    })
                    .then((res) => {
                        console.info("------- Find One : ", res);
                        return SyBase.models.WXUser.findAll({ id: res.id });
                    })
                    .then((res) => {
                        console.info("------- Find All : ", res);
                        return SyBase.models.WXUser.update(
                            { wxname: "updated name" },
                            { id: res[0].id }
                        );
                    })
                    .then((res) => {
                        console.info("------- Updated :", res);
                        return SyBase.models.WXUser.delete({ id: res.id });
                    })
                    .then(CRUD)
                    .catch((err) => {
                        console.error("********* Error :", err);
                        SyBase.models.WXUser.delete({ cardno: "90000011" });
                    });
            } else {
                console.error("Sybase not connected!!!");
            }
        }
    });
};

CRUD();

// SyBase.models.WXUser.by(SyBase.DBPools.main).execSql("select * from t_wxuser where id>=2000000 AND phone='15813880161'").then(res => console.info('-------- FindOne :', res))
