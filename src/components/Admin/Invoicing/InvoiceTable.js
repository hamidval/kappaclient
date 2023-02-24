import {Component} from 'react'
import axios from 'axios'
import DatePicker from "react-datepicker";
import ParentRow from './ParentRow'
import config from '../../../config.json'
import jsPDF from 'jspdf'
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.EMAIL_API_KEY);

class InvoiceTable extends Component {

    constructor(props){
        super(props)
        this.state ={
            data:null,
            students:null,
            parentsMap:null,
            dataTree:{parents:[]},
            fromDate:null,
            toDate:null,
            mapCreated:false,
            treeCreated:false,
            position:1,
            invoiceType:null,
            specificStudents:[],
            studentsOnDateRange:[],
            isListPrepared:false,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }

    }

    componentDidMount = async () =>{
        await this.getAllStudents();
     
    }

    setInvoiceType = async  (e) =>{
        await this.getAllStudents();
        this.setState({invoiceType:e.target.value})
        await this.setState({mapCreated:false})
        await this.setState({treeCreated:false})
        await this.setState({isListPrepared:false})
        await this.setState({dataTree:{parents:[]}})
    }

   getSpecificStudents = async () =>{

   }

   getStudentsWhoHaveLessonsInDatesRangeOnly = async ()=>{
        var lessons = []
        var students = []

        if(this.state.fromDate != null && this.state.toDate != null){
            await  axios.get('/api/taken-lessons/query?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()        ,
                {headers:this.state.options})
            .then(async (response) =>{
                lessons = await response.data
            
            })
        }

        await lessons.map((lesson,index)=>{
            if(students.indexOf(lesson.student) === -1) {
                students.push(lesson.student);                
            }
        })

        
        console.log(lessons)
        console.log(students);

        return students
   }

    getAllStudents = async () =>{
        await  axios.get('/api/students/all',
            {headers:this.state.options})
        .then(response=>{
            
            this.setState({students:response.data})
        })
    }

    setCheckbox = async (e,item) =>{
        var isChecked = await e.target.checked
        if(isChecked){
            this.setState({specificStudents:[...this.state.specificStudents, item]})
        }else{
            const index = await this.state.specificStudents.indexOf(item);
            console.log(index)
                if (index > -1) {
                    var list = await this.state.specificStudents.filter(a=>a!=item);
                    this.setState({specificStudents:list});
                }

        }

       
    }
  

    createMap = async () =>{
        var parentsMap = await new Map()
        await this.state.students.map((student)=>{
            if(!parentsMap.has(student.parent._id)){
                parentsMap[student.parent._id] = [student]
            }else{
                parentsMap[student.parent._id].push(student)
            }
        })
            console.log(parentsMap)
        await this.setState({parentsMap:parentsMap})
        await this.setState({mapCreated:true})
    }    


    createDataTree = async () =>{
        if(this.state.fromDate < this.state.toDate){
            
       
        var dataTree = this.state.dataTree
        Object.keys(this.state.parentsMap).map((pid,i) => {
            var parent = this.state.parentsMap[pid][0].parent 
            var students = this.state.parentsMap[pid]
            
           
            parent.students = []
            students.map(async (student,index)=>{
                
               var takenLessons = await this.getTakenLessonForStudent(student)
               student.takenLessons = takenLessons
               parent.students.push(student)
            })
            

            dataTree.parents.push(parent)

                  
    })  

        let stu = await this.state.dataTree.parents[0].students
        setTimeout(
            () => {
                this.setState({ position: 1 });
                console.log(this.state.dataTree);
        
        }, 
            3000
          );
        
        this.setState({treeCreated:true})
        }else{
            alert('dates error')
        }
        
    }

    getTakenLessonForStudent = async (student) =>{

        var takenLessons = [];
        await  axios.get('/api/taken-lessons/query?sid='+student._id+
        '&fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()        ,
            {headers:this.state.options})
        .then(async (response) =>{
            takenLessons = await response.data
        
        })
        return takenLessons;
    }

    prepareInvoiceList = async (e) =>{

        if(this.state.invoiceType != null){

            switch(parseInt(this.state.invoiceType)) {
                
                case 0:                    
                    var students = await this.getStudentsWhoHaveLessonsInDatesRangeOnly();
                    await this.setState({students:students})
                    this.setState({isListPrepared:true})
                  break;
                case 1:
                    this.setState({students:this.state.specificStudents})
                    await this.setState({isListPrepared:true})
                  break;
                case 2:
                    await this.setState({isListPrepared:true})
                  // code block
                  break;
                default:
                    alert('fail')
                  // code block
              }

        }

    }

    createInvoices = async (e) =>{
        var data = await this.state.dataTree.parents;

        data.map(async(parent,index)=>{
            await this.storeInvoice(parent._id)
        })
    }



    storeInvoice =async  (pid) =>{
        
        var startDate = this.state.fromDate
        var endDate = this.state.toDate
        var month = this.state.toDate.getMonth()+1
        var year = this.state.toDate.getFullYear();
        
    

        await  axios.post('/api/invoices?pid='+pid+
            '&year='+year+'&month='+month+'&sd='+startDate+'&ed='+endDate,
            {headers:this.state.options})
        .then(response=>{
            
           console.log(response.data)
        })


    }

    sendInvoice = async ()=>{

        await  axios.get('/api/invoices/all',
        {headers:this.state.options})
    .then(async response=>{
        
       
       var buffer = await response.data[0].data.data
       var b64 = Buffer.from(buffer).toString('base64')

      window.open("data:application/pdf," + encodeURI(b64))
    })

    }


    createInvoice = (parent) =>{
        var doc = new jsPDF()

            doc.text('Parent Name '+parent.firstName, 10, 10)
            parent.students.map((student,index)=>{
                doc.text('Student '+student.firstName, 10, 20)
                var data = []
                var total = 0;
                    student.takenLessons.map((lesson,index)=>{
                        console.log(lesson)
                        var obj = {
                                    date:lesson.date,
                                    subject:lesson.subject,
                                    correction:lesson.correction,
                                    hours:lesson.hours.toString(),
                                    price:lesson.price.toString(),
                                    FPL:(lesson.price*lesson.hours).toString()

                                  }

                                  total += (lesson.price*lesson.hours);
                        data.push(obj)
                    })
                    doc.table(10,30,data,["date","subject","correction","hours","price","FPL"])
                    doc.text('Fee For Month £'+total.toString(), 50, 20)
            })
            

            console.log(doc.output('datauri').toString());
            doc.save();
    }

    sendEmail = async  (e) =>{
        await  axios.get('/api/invoices/send',
        {headers:this.state.options})
    .then(async response=>{
        console.log(response.data)

    })
            
        
    }

    render(){

        var parents = this.state.dataTree.parents

        setTimeout(
            () => {
                this.setState({ position: 1 });
               
        
        }, 
            3000
          );

        return(
            <div>

                <div className="h1">
                    Invoice Table
                </div>

                {/* <div>
                    <button  className="btn btn-danger" onClick={this.storeInvoice} >store invoice</button>
                </div>

                <div> 
                    <button  className="btn btn-success" onClick={this.sendEmail} >send email</button>
                </div>

                <div>
                    <button  className="btn btn-warning" onClick={this.sendInvoice}>get buffer</button>
                </div> */}
             


                <div>
                    <h3>Invoice Dates</h3>
                    <div className="row">
                        <div className="col" >
                            <label>From Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.fromDate}
                                onChange={date => this.setState({fromDate:date})}
                                />  
                        </div>
                        <div className="col" >
                            <label>To Date</label>
                            <DatePicker className="form-control"
                                selected={this.state.toDate}
                                onChange={date => this.setState({toDate:date})}
                                />  
                        </div>
                    </div>

                {
                    this.state.fromDate != null && this.state.toDate != null ?
                   <div className="form-group">
                        <label>Invoice Type</label>
                        <select class="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.setInvoiceType(e)}>
                                            <option></option>
                                                <option value="0">Only students who had lessons in date range</option>
                                                <option value="1">Specific students</option>
                                                <option value="2">All (be careful)</option>
                        </select>
                    </div>

                    :null
                }

                {
                    this.state.invoiceType == 1?
                        <div>

                            {this.state.students?
                            
                                this.state.students.map((item,index)=>(
                                    <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value={item} id={index} onChange={e=>this.setCheckbox(e,item)} />
                                    <label class="form-check-label" for="flexCheckChecked">
                                        {item.firstName + ' ' + item.lastName}
                                    </label>
                                    </div>

                                ))
                            
                            
                            :null}
                            <div>
                                <button className="btn btn-primary" onClick={this.prepareInvoiceList}>Prepare Invoice List</button>
                            </div> 

                        </div>
                    :null

              

                }

                {
                    this.state.invoiceType != 1 && this.state.invoiceType != null?
                    <div>
                        <button className="btn btn-primary" onClick={this.prepareInvoiceList}>Prepare Invoice List</button>
                    </div>
                    :null

                }


              


                  {this.state.isListPrepared && this.state.mapCreated == false && this.state.invoiceType != null?

                    <div className="row" >
                            <div className="col">
                                <button className="btn btn-primary m-5"
                                    onClick={this.createMap}
                                >Create Map</button>
                            </div>
                        </div>
                  
                  : null}  
                   
                   {this.state.mapCreated == true?
                   <div>
                        <button className="btn btn-success m-5" 
                            onClick={this.createDataTree}
                            >Create Data Tree</button>
                    </div>
                   
                   :null}


                {
                    this.state.isListPrepared && this.state.mapCreated  && this.state.treeCreated?
                        <div>
                            Congrats!, looks like you're ready to store invoices
                            <p>Make sure you have checked the dates, the invoice type etc</p>
                            <p>Invoice Period  {this.state.fromDate.toString()} -- {this.state.toDate.toString()}</p>
                            <button className="btn btn-warning" onClick={this.createInvoices}>Create and Store Invoice</button>
                        </div>    
                    
                    :null
                }

            
                </div>
                

                {this.state.treeCreated?
                   this.state.dataTree?
                       parents.map((parent,index)=>(
                          <div>
                                <button className="btn btn-danger"
                                    onClick={()=>this.createInvoice(parent)}
                                >create invoice</button>
                               <ParentRow parent = {parent}/>    
                               <hr></hr>
                            
                            </div>    
                       ))
                   
                   :null
                :null}
            </div>
        )
    }
}

export default InvoiceTable