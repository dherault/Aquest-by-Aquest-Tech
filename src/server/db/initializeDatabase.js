import r from 'rethinkdb';
import createTables from './createTables';
import log from '../../shared/utils/logTailor';
import dbOptions from '../../../config/dev_rethinkdb';

export default function initializeDatabase() {
  log('+++ Initializing database...');
  
  return new Promise((resolve, reject) => {
    
    r.connect(dbOptions, (err, conn) => {
      if (err) return reject(err);
      
      r.dbList().run(conn, (err, result) => {
        if (err) return reject(err);
        
        const { db } = dbOptions;
        const closeConn = callback => {
          log('+++ Database initialized!');
          conn.close(callback);
        };
        
        if (result.indexOf(db) === -1) {
          
          log(`+++ Database ${db} could not be found, creating a new one...`); 
          r.dbCreate(db).run(conn, (err, result) => {
            if (err) return reject(err);
            
            createTables(conn).then(() => closeConn(resolve), reject);
          });
        } 
        else closeConn(resolve);
      });
    });
  });
}