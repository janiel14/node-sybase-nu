const SyBase = require('../dist/node_sybase')
const fs = require('fs');

const sybase = new SyBase([
    {
        name: 'main',
        host: 'localhost',
        port: 2638,
        dbname: 'contabil',
        username: 'NUCONT', // change
        password: '102030', // change
        logging: true,
        encoding: 'UTF-8'
    }
])

const init = async () => {
	await extractDataByCompanyId('bethadba.geempre', 490)
	await extractDataByCompanyId('bethadba.ctcontas', 490)
	await extractDataByCompanyId('bethadba.ctlancto', 490)
	await extractDataByCompanyId('bethadba.ctnatureza_conta', 490)
}

const mountCSV = (dataset) => {
	let data = ''
	Object.keys(dataset[0]).forEach((key) => {
		data = data + key  + ';' 
	})
	data = data + '\n'
	let i = 1
	dataset.forEach((item) => {
		Object.keys(item).forEach((key) => {
			data = data + item[key] + ';'
		})
		data = data + '\n'
		console.log('exported line:', i)
		i++
	})
	return data
}


const extractDataByCompanyId = async (tableName = '', companyId = '') => {
    try {
		let next = true
		let x = 1
		while(next) {
			const rs = await sybase.DBPools.main.query(`SELECT TOP 10000 START AT ${x} * FROM ${tableName} WHERE codi_emp=${companyId}`)
			if (rs.length > 0) {
				await createCSV(mountCSV(rs), `${tableName}_${x}`)
				x = x + 10000
			}
			if (rs.length === 0) {
				next = false
				return
			}
		}
    } catch (error) {
        console.error('error fatal: ', error)
    }	
}

const extractData = async (tableName = '') => {
    try {
		let next = true
		let x = 1
		while(next) {
			const rs = await sybase.DBPools.main.query(`SELECT TOP 10000 START AT ${x} * FROM ${tableName}`)
			if (rs.length > 0) {
				await createCSV(mountCSV(rs), `${tableName}_${x}`)
				x = x + 10000
			}
			if (rs.length === 0) {
				next = false
				return
			}
		}
    } catch (error) {
        console.error('error fatal: ', error)
    }	
}

const createCSV = async (data, fileName) => {
	try {
		fs.writeFile(`${fileName}.csv`, data, 'utf8', function (err) {
		  if (err) {
			console.log('Some error occured - file either not saved or corrupted file saved.');
		  } else{
			console.log('It\'s saved!');
		  }
		})
	} catch (error) {
		console.error(error)
	}
}

init();
