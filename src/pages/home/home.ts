import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite, SQLiteObject} from '@ionic-native/sqlite';
import { AdddataPage } from '../adddata/adddata';
import { EditdataPage } from '../editdata/editdata';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  expenses: any = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  i="";
  constructor(public navCtrl: NavController, public sqlite : SQLite) {
  }

  //Load Page
  ionViewDidLoad(){
    this.getData();
  }

  //Back Page
  ionViewWillEnter(){
    this.getData();
  }
  
  getData(){
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then(
      (db: SQLiteObject)=>{
        db.executeSql('CREATE TABLE IF NOT EXISTS expense (rowid INTEGER PRIMARY KEY, date TEXT, type TEXT, description TEXT, amount INT)',[])
          .then(res=>{console.log('Executed SQL');})
          .catch(e=>{console.log(e);});
        db.executeSql('SELECT * FROM expense ORDER BY rowid DESC',[])
          .then(res=>{
            this.expenses=[];
            for(var i=0;i<res.rows.length;i++){
              //อ่านค่าทุกแถวมาใส่ใน object
              this.expenses.push({
                rowid: res.rows.item(i).rowid,
                date: res.rows.item(i).date,
                type: res.rows.item(i).type,
                description: res.rows.item(i).description,
                amount: res.rows.item(i).amount
              });
            }
          })
          .catch(e=>{console.log(e);});
        
        //หารายรับรวม
        db.executeSql('SELECT SUM(amount) AS totalIncome FROM expense WHERE type="Income"',[])
          .then(res=>{
            if(res.rows.length>0){
              this.totalIncome = parseInt(res.rows.item(0).totalIncome);
            }
            else{
              this.totalIncome=0;
            }
            this.balance = this.totalIncome - this.totalExpense;
          })
          .catch(e=>{console.log(e);});
        
        //หารายจ่ายรวม
        db.executeSql('SELECT SUM(amount) AS totalExpense FROM expense WHERE type="Expense"',[])
          .then(res=>{
            if(res.rows.length>0){
              this.totalExpense = parseInt(res.rows.item(0).totalExpense);
            }
            else{
              this.totalExpense=0;
            }
            this.balance = this.totalIncome - this.totalExpense;
          })
          .catch(e=>{console.log(e);});
      }
    );
  }
  addData(){
    this.navCtrl.push(AdddataPage);
  }

  editData(rowid){
    this.navCtrl.push(EditdataPage,{ rowid : rowid });
  }

  deleteData(rowid){
    this.sqlite.create(
      {
        name: 'ionicdb.db',
        location: 'default'
      }
    )
    .then(
      (db: SQLiteObject)=>{
        db.executeSql('DELETE FROM expense WHERE rowid=?',[rowid])
          .then(res=>{
            console.log(res);
            this.getData();
          })
          .catch(e=>console.log(e));
      }
    )
    .catch(e=>console.log(e));
  }
}