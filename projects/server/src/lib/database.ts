import mysql from 'mysql';
import { EventEmitter } from 'events';
import { SHA3 } from 'sha3';


class Database extends EventEmitter {
  public ready: boolean = false;
  private _connection: mysql.Connection;
  private _database: string;

  constructor (host: string, user: string, password: string, dbname: string) {
    super();

    this._connection = mysql.createConnection({
      host: host,
      user: user,
      password: password,
			multipleStatements: true
    });
    this._connection.connect();

    if(this._connection.state === 'disconnected'){
      console.log('DB CONNECTION FAILED!!!!')
    }

    this._database = dbname;

    this.init();
  }

  public end () {
    this._connection.end();
  }

  public query (query: string, cb: (err: mysql.MysqlError, result: any, fields: any) => void) {
    this._connection.query(query, (err: mysql.MysqlError, result: any, fields: any) => {
      cb(err, result, fields);
    });
  }

  private createDatabase (callback: () => void) {
    this.query(`
      CREATE DATABASE ${this._database};
      USE ${this._database};`, (err, result) => {
      this.query(Database.Sql.createAll(), (err, result) => {
        callback();
      })
    });
  }

  private init () {
    this.query(`SHOW DATABASES LIKE '${this._database}'`, (err, result) => {
      if(!(result && result.length)) { // Doesn't exist
        this.createDatabase(() => {
          this.ready = true;
          this.emit('ready');
        });
      } else {
        this.query(`USE ${this._database};`, (err, result) => {
          this.ready = true;
          this.emit('ready');
        });
      }
    });
  }

  public getUserBySocialClub (socialClubName: string, cb: (userData: any) => void) {
    this.query(Database.Sql.getUserBySocialClub(socialClubName), (err, result) => {
      cb(result.length ? result[0] : null)
    });
  }

  public addUser (socialClubName: string, email: string, hash: string, salt: string, cb: (err?: string) => void) {
    const sha3hash = new SHA3(512);
    sha3hash.update(hash);

    this.getUserBySocialClub(socialClubName, (userData: any) => {
      if (userData != null) {
        cb('User already registered');
        return;
      }

      const query = Database.Sql.addUser(socialClubName, email, sha3hash.digest('hex'), salt);
      this.query(query, (err, result) => {
        cb();
      });
    });
  }

  public checkUserPassword (socialClubName: string, hash: string, cb: (success: boolean) => void) {
    this.getUserBySocialClub(socialClubName, (userData: any) => {
      if (userData == null || !('PasswordHash' in userData)) {
        cb(false);
      }

      const sha3hash = new SHA3(512);
      sha3hash.update(hash);
      cb(sha3hash.digest('hex') === userData.PasswordHash);
    });
  }
}

namespace Database {
  export class Sql {
    public static merge (...args: string[]) {
      return args.map((v) => {
        return v + (/;\n?$/g.test(v) ? '' : ';\n')
      }).join('');
    }

    public static createAll () {
      return Sql.merge(
        Sql.createUsersTable,
        Sql.createTeamsTable,
        Sql.createZonesTable
      );
    }

    public static addUser (socialClubName: string, email: string, hash: string, salt: string) {
      return `
        INSERT INTO users (
          SocialClubName,
          Email,
          PasswordHash,
          PasswordSalt
        ) VALUES (
          '${socialClubName}', '${email}', '${hash}', '${salt}'
        );`;
    }

    public static getUserBySocialClub (socialClubName: string) {
      return `
        SELECT
        Email, PasswordHash, PasswordSalt, AdminLevel, XP
        FROM users
        WHERE SocialClubName='${socialClubName}';`
    }

    public static get createUsersTable () {
      return `
        CREATE TABLE users (
          ID int(11) AUTO_INCREMENT PRIMARY KEY,
          SocialClubName varchar(32),
          Email varchar(32),
          PasswordHash varchar(512),
          PasswordSalt varchar(64),
          AdminLevel tinyint(1) DEFAULT 0,
          XP int(11) DEFAULT 0,
          RegisterDate datetime DEFAULT CURRENT_TIMESTAMP,
          LastLogin datetime DEFAULT NULL,
          PlayTime timestamp DEFAULT 0
        );`;
    }

    public static get createTeamsTable () {
      return `
        CREATE TABLE teams (
          ID int(11) AUTO_INCREMENT PRIMARY KEY,
          Slug varchar(32),
          Hash varchar(32)
        );`;
    }

    public static get createZonesTable () {
      return `
        CREATE TABLE zones (
          ID int(11) AUTO_INCREMENT PRIMARY KEY,
          Slug varchar(32),
          Hash varchar(32),
          TeamID int(11) DEFAULT NULL,

          FOREIGN KEY (TeamID) REFERENCES teams (ID)
        );`;
    }
  }
}

export default Database;
