import react,{Component} from 'react'
import axios from 'axios'
import DatePicker from "react-datepicker";
import jsPDF from 'jspdf'
import {ToggleButtonGroup,ToggleButton,Button} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle,faCheckCircle } from '@fortawesome/free-solid-svg-icons'

require ('jspdf-autotable')
Date.prototype.formatDDMMYYYY = function(){
    return (this.getDate() +"/"+ (this.getMonth() + 1)+ 
    "/" +  this.getFullYear());
}

class InvoiceTable2 extends Component {

    constructor(props){
        super(props)
        this.state ={
            data:null,
            students:[],
            filteredStudents:[],
            parents:[],
            filteredParents:[],
            fromDate:new Date("Fri Mar 19 2021 00:00:00 GMT+0000 (Greenwich Mean Time)"),
            toDate:new Date("Fri Jul 30 2021 00:00:00 GMT+0000 (Greenwich Mean Time)"),
            invoiceType:null,
            specificStudents:[],
            studentsOnDateRange:[],
            isListPrepared:false,
            chosenPids:[],
            action:0,
            showPaymentModal:false,
            chosenInvoice:null,
            changeTo:null,
            redirectUrl:"/",
            modalPaidStatus:null,
            canRefresh:true,
            invoiceRecords:null,
            invoiceRecordsCopy:null,
            loading:false,
            numberOfStudentsToGet:0,
            numberOfParentsToGet:0,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }

    }

    componentDidMount = async () =>{

    }

    moreStudents = async (e)=>{

        
        await this.getAllStudents();


    }
    moreParents = async (e)=>{

      
        await this.getAllParents()


    }

    setInvoiceType = async  (e) =>{
 

        if(this.state.invoiceType != null){
            this.setState({invoiceType:null})
        }else{
            this.setState({invoiceType:e})
        }
      
        await this.setState({isListPrepared:false})
     
        await this.setState({chosenPids:[]})
        await this.setState({specificStudents:[]})
      
    }

   getStudentsFromPids = async (pids) =>{

    var idsString = "";

    
    
    pids.map((id,index)=>{
        idsString = idsString + 'pids=' + id.toString()
        if((pids.length-1) != index){
            idsString = idsString+'&'
        } 
    })
    await console.log(idsString);

    await  axios.get('/api/students/pids?'+idsString,
    {headers:this.state.options})
        .then(async (response) =>{
            var students = await response.data
            console.log(response.data)
            this.setState({students:students})

        })

   }

   getStudentsWhoHaveLessonsInDatesRangeOnly = async ()=>{
      
        var students = []
        console.log(this.state.options)
        if(this.state.fromDate != null && this.state.toDate != null){
            this.setState({loading:true})
            await  axios.post('/api/taken-lessons/distinct-student-in-range',
                {headers:this.state.options,data:{fromDate:this.state.fromDate.toString(),toDate:this.state.toDate.toString() }})
            .then(async (response) =>{
                console.log(response.data)
                students = await response.data
                this.setState({loading:false})
            
            })
        }


        return students
   }

   getInvoicesByStudent = async ()=>{
      
    var students = []
    var idsString = "";
    this.state.specificStudents.map((student,item)=>{
        idsString += ('sids='+student._id.toString()+'&')
    })
    

    if(this.state.fromDate != null && this.state.toDate != null){
        this.setState({loading:true})
        await  axios.get('/api/invoices/invoice-by-student?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()+'&'+idsString        ,
            {headers:this.state.options})
        .then(async (response) =>{
            console.log(response.data,"data")
            students = await response.data
            this.setState({loading:false})
        
        })
    }


    return students
}

getInvoicesByParent = async ()=>{
     
    var students = []
    var idsString ="";
    this.state.chosenPids.map((pid,item)=>{
        idsString += ('pids='+pid.toString()+'&')
    })
    
        
    if(this.state.fromDate != null && this.state.toDate != null){
        await  axios.get('/api/invoices/invoice-by-parent?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()+'&'+idsString        ,
            {headers:this.state.options})
        .then(async (response) =>{
            console.log(response.data)
            students = await response.data
        
        })
    }


    return students
}

    getAllStudents = async () =>{

        this.setState({loading:true})
        await  axios.get('/api/students/all-custom?skip='+this.state.numberOfStudentsToGet+'&limit=25',
            {headers:this.state.options})
        .then(async response=>{
            console.log(response.data)
            var students = await this.state.students.concat(response.data)
            this.setState({students:students})
            this.setState({filteredStudents:students})
            this.setState({loading:false})
            this.setState({numberOfStudentsToGet:this.state.numberOfStudentsToGet+25})
        })
    }

    getAllParents = async () =>{
        this.setState({loading:true})
        await  axios.get('/api/parents/all-custom?skip='+this.state.numberOfParentsToGet+'&limit=25',
            {headers:this.state.options})
        .then(async response=>{
     
            var parents = await this.state.parents.concat(response.data)
            this.setState({parents:parents})
            this.setState({filteredParents:parents})
            this.setState({loading:false})
            this.setState({numberOfParentsToGet:this.state.numberOfParentsToGet+25})
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


        console.log(this.state.specificStudents);

       
    }

    setParentCheckbox = async (e,item) =>{
        var isChecked = await e.target.checked
        if(isChecked){
            this.setState({chosenPids:[...this.state.chosenPids, item._id]})
        }else{
            const index = await this.state.chosenPids.indexOf(item._id);
            
                if (index > -1) {
                    var list = await this.state.chosenPids.filter(a=>a!=item._id);
                    this.setState({chosenPids:list});
                }

        }
        console.log(this.state.chosenPids)
       
    }


    getStudentsFromParent = async (pid) =>{

        var students = [];
        await  axios.get('/api/students/pid?pid='+pid,
            {headers:this.state.options})
        .then(async (response) =>{
            var data = await response.data
            students = data.map((s)=>{
                 var obj =   {_id: s._id,firstName:s.firstName,lastName:s.lastName }

                    return obj
        })
        
        })
        return students;
    }



    getTakenLessonForStudent = async (sid) =>{

        var takenLessons = [];
        await  axios.get('/api/taken-lessons/query?sid='+sid+
        '&from='+this.state.fromDate.toString()+'&to='+this.state.toDate.toString()        ,
            {headers:this.state.options})
        .then(async (response) =>{
            var data = await response.data
            takenLessons = data.map((tl)=>{
                 var obj =   {correction: tl.correction,
                                date: tl.date,
                                day: tl.day,
                                discount: tl.discount,
                                hours: tl.hours,
                                isExtra: tl.isExtra,
                                price: tl.price,
                                rateKey:  tl.rateKey,
                                subject: tl.subject
                                }

                    return obj
        })
        
        })
        return takenLessons;
    }

    prepareInvoiceList = async (e) =>{

        console.log(this.state.invoiceType)
        if(this.state.invoiceType != null){

            switch(parseInt(this.state.invoiceType)) {
                
                case 0:                    
                    var invoiceRecords = await this.getStudentsWhoHaveLessonsInDatesRangeOnly();
                    await this.setState({invoiceRecords:invoiceRecords})
                    await this.setState({invoiceRecordsCopy:invoiceRecords})
                    this.setState({isListPrepared:true})
                  break;
                case 1:
                    var invoiceRecords = await this.getInvoicesByStudent()
                    await this.setState({invoiceRecords:invoiceRecords})
                    await this.setState({invoiceRecordsCopy:invoiceRecords})
                    await this.setState({isListPrepared:true})
                  break;
                case 2:
                    await this.setState({isListPrepared:true})
                  // code block
                  break;
                case 3:
                    ////still to do
                    
                    var invoiceRecords = await this.getInvoicesByParent()
                    await this.setState({invoiceRecords:invoiceRecords})
                    await this.setState({invoiceRecordsCopy:invoiceRecords})
                    // await this.setState({students:students})
                    await this.setState({isListPrepared:true})
                  // code block
                  break;
                default:
                    alert('fail')
                  // code block
              }

        }

    }

    createInvoices = async () =>{ // for all records
        var data = await this.state.invoiceRecords;

        data.map(async(ir,index)=>{
            await this.storeInvoice(ir.parent._id)
        })
    }

    createInvoicesForNotCreated = async () =>{
        var data = await this.state.invoiceRecords.filter((ir)=>ir.created == 0) 
        data.map(async(ir,index)=>{
            await this.storeInvoice(ir.parent._id)
        })

    }

    sendInvoicesForAllRecords = async () =>{
        var data = await this.state.invoiceRecords.filter(ir=>ir.created != 0)
        var invoices = await data.map(ir=>ir)
        await this.sendInvoices(invoices);

    }

    sendInvoiceForNotSent = async (e) =>{
        var irs = await this.state.invoiceRecords.filter(ir=>ir.created != 0)
        var data = await irs.filter(ir=>ir.sent == 0)
        var invoices = await data.map(ir=>ir)
        await this.sendInvoices(invoices);

    }

    openPaymentModal = (e) =>{
        this.togglePaymentModal(e)
        //this.setState({chosenInvoice:invoice})
        

    }

    togglePaymentModal = (e) =>{
        this.setState({showPaymentModal2:!this.state.showPaymentModal2})
    }

    executeAction = async () =>{
        var action = parseInt(this.state.action);

        switch(action) {
            case 1:
              await this.createInvoices();
              
              break;
            case 2:
              this.createInvoicesForNotCreated();
              break;
            case 3:
              this.sendInvoicesForAllRecords();
               break;
            case 4:
                this.sendInvoiceForNotSent();
                break;
            default:
              alert('no action to call');
          }

          setTimeout(
            () => {
                this.refreshData();
               
        
        }, 
            3000
          );

        
    }

    test = async (e)=>{
        await  axios.get('/api/invoices/test?sd=2021-03-08&ed=2021-06-25&pid=5ff0a77083571c3cb43d7890',
                    {headers:this.state.options})
                .then(async (response) =>{
                    var res = await response.data
                    console.log(res)
                
                })
    }

    sendInvoices = async  (invoices)  =>{
        if(invoices.length > 0){
            var ids = await invoices.map(a=> a._id)

            console.log(invoices,"ids")

            var idsString = "";

            ids.map((id,index)=>{
                idsString = idsString + '&ids='+ id.toString()
            })

          
            var res = await  axios.get('/api/invoices/send?'+idsString,
                    {headers:this.state.options}).then(response => { 
                        console.log(response.status)
                    })
                    .catch(error => {
                       
                        if(error.response.status == 401){
                            alert('invoices cannot be sent at the moment')
                        }
                  
                    });
            if(invoices.length > 100){
                alert('only 100 were sent, filter for unsent and send again tomorrow')
            }
        }



    }



    storeInvoice =async  (pid) =>{
        
        var startDate = this.state.fromDate
        var endDate = this.state.toDate
        var month = this.state.toDate.getMonth()+1
        var year = this.state.toDate.getFullYear();
        
        

        await  axios.post('/api/invoices?pid='+pid+
            '&year='+year+'&month='+month+'&sd='+startDate.toString()+'&ed='+endDate.toString(),
            {headers:this.state.options})
        .then(response=>{
            
           console.log(response.data)
        })


    }

  


    createInvoice3 = async (parent)=>{

        const students = await this.getStudentsFromParent(parent._id);

        const studs =  students.map(async(student,index)=>{
            var lessons = await  this.getTakenLessonForStudent(student._id)
            
            student.takenLessons = await lessons
        })

        const numFruits = await Promise.all(studs)
        var lessonsString = "";
        var total = 0

        students.map((student,index)=>{
            lessonsString =lessonsString+`<div class="row mt-3" style="font-size:5px" >
                                            <div class="col">
                                                Student : ${student.firstName}
                                            </div>
                                          </div>`
            var tableString = `
                            
                                    <div class="row" style="font-size:5px" >
                                        <div class="col" style="width:30px !important" >Date</div>
                                        <div class="col" style="width:30px !important">Subject</div>
                                        <div class="col" style="width:30px !important">Correction</div>
                                        <div class="col" style="width:30px !important">Hours</div>
                                        <div class="col" style="width:30px !important">Price</div>
                                        <div class="col" style="width:30px !important">Total</div>
                                    </div>
                              
            
                                `;

            student.takenLessons.map((tl,index)=>{
                var date = (new Date(tl.date)).formatDDMMYYYY().toString()
                tableString=tableString+`<div class="row" style="font-size:5px"  >   
                                                <div class="col" style="width:30px" >${date.toString()}</div>
                                                <div class="col" style="width:30px" >${tl.subject.toString()}</div>
                                                <div class="col" style="width:30px">${tl.correction.toString()}</div>
                                                <div class="col" style="width:30px">${tl.hours.toString()}</div>
                                                <div class="col" style="width:30px">${tl.price.toString()}</div>
                                                <div class="col" style="width:30px">${(tl.price*tl.hours).toString()}</div>
            
                                                </div>`
                total += (tl.price*tl.hours)
            })
            
            lessonsString+=tableString
        })

        var doc = await  new jsPDF()
        var str = 
        `
        <html>
            <head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            </head>
        
            <body>
                <div id="container" class="container" style="width:210px;">
                    <h1 class="mb-3" style="font-size:10px !important;" >MSLC Invoice</h1>
                    <div style="font-size:5px;" >Cheques payable to :  MS Learning Circle Ltd</div>
                    <div style="font-size:5px" >Electronic payments to: </div>
                    <div class="mb-3" style="font-size:5px" >Bank :  HSBC</div>

                    <div class="mb-3"  style="font-size:7px" >Total for invoice : <b>£${total.toString()}</b></div>


                    ${lessonsString}



                </div>
                
            </body>
            <style>
            
            </style>
        </html>
        `
        console.log(str)
        await doc.html(str)
        await doc.save()
    }

    createInvoice = async(parent)=>{

        const students = await this.getStudentsFromParent(parent._id);

        const studs =  students.map(async(student,index)=>{
            var lessons = await  this.getTakenLessonForStudent(student._id)
            
            student.takenLessons = await lessons
        })

        const numFruits = await Promise.all(studs)
        var lessonsString = "";

        students.map((student,index)=>{
            lessonsString =lessonsString+`<p>Student : ${student.firstName}</p>`
            var tableString = `<table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>subject</th>
                                        <th>-</th>
                                        <th>Hours</th>
                                        <th>Price</th>
                                        <th>Fee</th>
                                    <tr>
                                </thead>
            
                                <tbody>`;
            student.takenLessons.map((tl,index)=>{
                var date = (new Date(tl.date)).formatDDMMYYYY().toString()
                tableString=tableString+`<tr>   <td>${date.toString()}</td>
                                                <td>${tl.subject.toString()}</td>
                                                <td>${tl.correction.toString()}</td>
                                                <td>${tl.hours.toString()}</td>
                                                <td>${tl.price.toString()}</td>
                                                <td>${(tl.price*tl.hours).toString()}</td>
                                             </tr>`
            })
            tableString+=`</tbody></table>`
            lessonsString+=tableString
        })
   
        var doc = await new jsPDF();
        var str = await `<div style="font-size:5px">
                            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                            <style>
                            
                            </style>
                            <h1  >MSLC Invoice</h1>
                            <p  >CHEQUES PAYABLE TO: MS Learning Circle Ltd</p>
                            <p  >ELECTRONIC PAYMENTS TO:</p>
                            <p  >Bank: HSBC</p>

                            <p>Parent : ${parent.firstName}</p>

                            ${lessonsString}
                            
                           
                            </div>

                        </div>`
            await doc.html(str);
        await doc.save()
     
       

    }


    createInvoice2 = async (parent) =>{

        const students = await this.getStudentsFromParent(parent._id);

        const studs =  students.map(async(student,index)=>{
            var lessons = await  this.getTakenLessonForStudent(student._id)
            
            student.takenLessons = await lessons
        })

        const numFruits = await Promise.all(studs)
        var height = 10
        var increment = 5;
        var leftMargin = 20
        var doc = await new jsPDF()
       await doc.text('', leftMargin, height)
        height+=increment;
       await doc.text('MSLC Monthly Invoice', leftMargin, height)
        height+=increment*3;
       await doc.setFontSize(9).text('CHEQUES PAYABLE TO: MS Learning Circle Ltd', leftMargin, height)
        height+=increment;
       await doc.text('ELECTRONIC PAYMENTS TO:', leftMargin, height)
        height+=increment;
       await doc.text('BANK :                     HSBC PLC', leftMargin, height)
        height+=increment;
       await doc.text('ACCOUNT NAME:    MS Learning Circle Ltd', leftMargin, height)
        height+=increment;
       await doc.text('SORT CODE:           40-07-18', leftMargin, height)
        height+=increment;
       await doc.text('ACCOUNT NO:         71304682', leftMargin, height)
        height+=increment;
       await doc.text('Parent : '+parent.firstName, leftMargin, height)
       var total = 0;
            await students.map((student,index)=>{
                height += increment*2;
                doc.text('Student : '+student.firstName, leftMargin, height)
                height += increment;
                var data = []
                var tableHeight = 0;
                
                    student.takenLessons.map((lesson,index)=>{
                        tableHeight += 10;
                        var date = (new Date(lesson.date)).formatDDMMYYYY().toString()
                        var obj = [
                                    date,
                                    lesson.subject,
                                    lesson.correction,
                                    lesson.hours.toString(),
                                    lesson.price.toString(),
                                    (lesson.price*lesson.hours).toString()

                        ]

                                  total += (lesson.price*lesson.hours);
                        data.push(obj)
                    })
                    
                    doc.autoTable({ head:[["date","subject","correction","hours","price","FPL"]],body:data,startY:height})
                    height = height + tableHeight
                   
            })
            
            doc.text('Fee For Month £'+total.toString(), 100, 60)
            console.log(doc.output('datauri').toString());
            doc.save();
    }



    createRedirectUrl = () =>{
            

    if(this.state.parentsMap != null){  
            var url = "payment-panel?temp=test";          
            Object.keys(this.state.parentsMap).map((pid,i) => {
                url = url+ "&pid="+pid
            })
 
            url = url + "&month="+ (this.state.toDate.getMonth()+1)
            url = url + "&year="+ this.state.toDate.getFullYear();


          this.setState({redirectUrl:url})
          console.log(this.state.redirectUrl)

        }else{
            alert('no url ');
            
        }

      

    }

    updatePayment = (invoice) =>{
        this.setState({showPaymentModal:!this.state.showPaymentModal})
        this.setState({chosenInvoice:invoice})
        console.log(invoice)

    }

    paidExact = (e) =>{
        this.setState({modalPaidStatus:0})
        this.setState({changeTo:this.state.chosenInvoice.total})
        
    }

    confirmPaymentUpdate = async () =>{

        if(this.state.modalPaidStatus != null){

            if(this.state.changeTo != null){

                var error = false;

                if(this.state.modalPaidStatus == 0 && (this.state.changeTo != this.state.chosenInvoice.total )){
                    error = true
                }
                if(this.state.modalPaidStatus == 1 && (this.state.changeTo >=  this.state.chosenInvoice.total )){
                    error = true
                }
                if(this.state.modalPaidStatus == 2 && (this.state.changeTo <=  this.state.chosenInvoice.total )){
                    error = true
                }
                if(!error){
                    var invoice = await this.state.chosenInvoice
                    await  axios.get('/api/invoices/update-payment?id='+invoice._id+'&amount='+this.state.changeTo+'&status='+this.state.modalPaidStatus,
                            {headers:this.state.options})
                        .then(async (response) =>{
                            console.log(response.data)
                        
                        })

                    this.setState({showPaymentModal:!this.state.showPaymentModal})
                    alert('payment updated');
                    }else{
                        alert('payemnt entry error')
                    }
                }else{
                alert('change to is null');
            }


        }else{
            alert('null paid status')
        }

        
    }
    refreshData = async (e) =>{
        this.prepareInvoiceList();
     

       
    }

    filterStudents = async (term) =>{

        var filteredStudents = this.state.students.filter((s)=>s.firstName.toLowerCase().includes(term.toLowerCase()) || s.lastName.toLowerCase().includes(term.toLowerCase()))
        this.setState({filteredStudents:filteredStudents})
    }

    filterParents = async (term) =>{

        var filteredParents = this.state.parents.filter((p)=>p.firstName.toLowerCase().includes(term.toLowerCase()) || p.lastName.toLowerCase().includes(term.toLowerCase()))
        this.setState({filteredParents:filteredParents})
    }

    filterForUnsent = async (e) =>{
        var irs = await this.state.invoiceRecordsCopy.filter(ir=>ir.created == null || ir.sent == 0 )
      
        await this.setState({invoiceRecords:irs})

    }

    filterForSent = async (e) =>{
        var irs = await this.state.invoiceRecordsCopy.filter(ir=>ir.created > 0)
        var invoiceRecords = await irs.filter((a)=>a.sent > 0)
        await this.setState({invoiceRecords:invoiceRecords})

    }

    bothSentAndUnsent =async (e)=>{
        this.setState({invoiceRecords:this.state.invoiceRecordsCopy})
    }

    render(){

        return(
            <div>

                <div className="h1">
                    Invoice Table
                </div>  
                <div className="container">
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

                    <div className="btn-group" role="group" aria-label="Basic checkbox toggle button group">
                    
                    <button class="btn btn-primary" disabled={(this.state.invoiceType != 0 && this.state.invoiceType != null) || this.state.loading} onClick={(e)=>this.setInvoiceType(0)} for="btncheck3">Students in range</button>
                  
                    
                    <button class="btn btn-primary" disabled={(this.state.invoiceType != 1 && this.state.invoiceType != null) || this.state.loading} onClick={(e)=>this.setInvoiceType(1)} for="btncheck3">Students</button>
                  
                    
                    <button class="btn btn-primary" disabled={(this.state.invoiceType != 2 && this.state.invoiceType != null) || this.state.loading} onClick={(e)=>this.setInvoiceType(2)} for="btncheck3">all</button>

                    <button class="btn btn-primary" disabled={(this.state.invoiceType != 3 && this.state.invoiceType != null) || this.state.loading} onClick={(e)=>this.setInvoiceType(3)} for="btncheck3">parents</button>
                  </div>
                 
                    :null
                }
             

                {
                    this.state.invoiceType == 1?
                        <div style={{textAlign:'left'}}>

                            <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="basic-addon1">search</span>
                            </div>
                            <input type="text" class="form-control" placeholder="first name.. last name.." onChange={e=>this.filterStudents(e.target.value)}/>
                            </div>   

                            {this.state.filteredStudents?
                            
                                this.state.filteredStudents.map((item,index)=>(
                                    <div class="form-check">
                                   {!this.state.isListPrepared? <input class="form-check-input" type="checkbox" value={item} id={index} onChange={e=>this.setCheckbox(e,item)} />:null}
                                    <label class="form-check-label" for="flexCheckChecked">
                                        {item.firstName + ' ' + item.lastName}
                                    </label>
                                    </div>

                                ))
                            
                            
                            :null}

                            <div className="row">
                                <div className="col">
                                    <button className="btn btn-primary" disabled={this.state.loading} onClick={this.moreStudents}>more</button>
                                </div>                                   
                            </div>


                            <div>
                                <button className="btn btn-primary" disabled={this.state.loading} onClick={this.prepareInvoiceList}>Prepare Invoice List</button>
                            </div> 

                        </div>
                    :null


                    

              

                }

                {
                    this.state.invoiceType == 3?
                        <div style={{textAlign:'left'}} >

                             <div class="input-group mb-3">
                            <div class="input-group-prepend">
                                <span class="input-group-text" id="basic-addon1">search</span>
                            </div>
                            <input type="text" class="form-control" placeholder="first name.. last name.." onChange={e=>this.filterParents(e.target.value)}/>
                            </div>   

                            {this.state.filteredParents?
                            
                                this.state.filteredParents.map((item,index)=>(
                                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value={item} id={index} onChange={e=>this.setParentCheckbox(e,item)} />
                                    <label class="form-check-label" for="flexCheckChecked">
                                        {item.firstName + ' ' + item.lastName}
                                    </label>
                                    </div>

                                ))
                            
                            
                            :null}

                            <div className="row">
                                <div className="col">
                                    <button className="btn btn-primary" disabled={this.state.loading} onClick={this.moreParents}>more</button>
                                </div>                                   
                            </div>
                            <div>
                                <button className="btn btn-primary" disabled={this.state.loading} onClick={this.prepareInvoiceList}>Prepare Invoice List</button>
                            </div> 

                        </div>
                    :null

              

                }             


                  {this.state.invoiceType != 1 && this.state.invoiceType != 3  && this.state.invoiceType != null?

                        <div>
                        <button disabled={!this.state.canRefresh} disabled={this.state.loading} className="btn btn-primary m-5" 
                            onClick={this.prepareInvoiceList}
                            >Prepare Invoice List</button>
                        </div>
                  
                  : null}  
                   
             
                    {
                        this.state.isListPrepared && this.state.invoiceRecords?
                        <div>
              
              <ToggleButtonGroup  variant={"outline-primary"} type="radio" name="options" defaultValue={1}>
                    <Button onClick={this.bothSentAndUnsent} variant={"outline-dark"} value={1}>All</Button>
                    <Button onClick={this.filterForSent} variant={"outline-dark"} value={2}>Sent</Button>
                    <Button onClick={this.filterForUnsent} variant={"outline-dark"} value={3}>Not Sent</Button>
                </ToggleButtonGroup>
                      </div>
                        :null
                    }


           


                {
                    this.state.isListPrepared && this.state.invoiceRecords?
                        <div className="row">
                            <div className="col m-2" style={{border:'solid 1px black',borderRadius:'5px'}}>
                            <p>Invoice Period  {this.state.fromDate.formatDDMMYYYY().toString()} -- {this.state.toDate.formatDDMMYYYY().toString()}</p>
                            {/* <button className="btn btn-warning" onClick={this.createInvoices}>Create and Store Invoice</button> */}


                            <select className="form-control" aria-label="Default select example" onChange={e=>this.setState({action:e.target.value})}>
                                <option >Open this select menu</option>
                                <option value="1">create invoices for all records</option>
                                <option value="2">create invoices for when created = false</option>
                                <option value="3">send emails for all records</option>
                                <option value="4">send emails for when sent = false</option>
                            </select>

                            <button className="btn btn-primary m-2" onClick={this.executeAction}>
                                    Go!

                            </button>
                            <a className="btn btn-primary m-5" href={this.state.redirectUrl}>
                                    Go to Payments!
                            </a>
                            </div>   
                       
                          
                            <div className="col m-1" >{
                                this.state.showPaymentModal && (this.state.chosenInvoice != null)?
           
                               <div className="row card" style={{border:'solid 1px black',borderRadius:'5px'}}>                                
                                   <div className="col">
                                       <h5>Edit Payment</h5>
                                       <div className="row">
                                           <div className="col" >
                                            <label>ID</label>
                                           </div>
                                           <div className="col" >
                                            <div>{this.state.chosenInvoice._id}</div>
                                           </div>                                                   
                                       </div>
                                       <div className="row">
                                            <div className="col" >
                                                    <label>Total</label>
                                           </div>
                                           <div className="col" >
                                                <div>{this.state.chosenInvoice.total}</div>
                                           </div>  
                                         
                                       </div>
                                       <div className="row mb-3">
                                            <div className="col" >
                                            <label>PaymentAmount</label>
                                           </div>
                                           <div className="col" >
                                           <div>{this.state.chosenInvoice.paymentAmount}</div>
                                           </div>  
                                         
                                       </div>      
                                 
                                                        <div class="form-check">
                                                       <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2" onChange={e=>this.setState({modalPaidStatus:1})} />
                                                       <label class="form-check-label" for="exampleRadios2">
                                                           Paid Less
                                                       </label>
                                                       </div>
                                                       <div class="form-check">
                                                       <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option3" onChange={e=>this.setState({modalPaidStatus:2})}/>
                                                       <label class="form-check-label" for="exampleRadios2">
                                                           Paid More
                                                       </label>
                                                       </div>
                                                       <div class="form-check">
                                                       <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option3" onChange={this.paidExact}/>
                                                       <label class="form-check-label" for="exampleRadios2">
                                                           Paid Exact
                                                       </label>
                                                       </div>
                                       
                                       
                                       <div className="row mb-3">
                                            <div className="col" >
                                            <label >change to</label>
                                           </div>
                                           <div className="col" >
                                           <input className="form-control" value={this.state.changeTo} onChange={(e)=>this.setState({changeTo:e.target.value})}></input>
                                           </div>  
                                         
                                       </div>
                                       <button className="btn btn-primary  m-23" onClick={this.confirmPaymentUpdate} >Confirm</button>
                                       
                                       <button className="btn btn-danger m-2" onClick={(e)=>this.setState({showPaymentModal:false})} >cancel</button>
           
                                   </div>    
           
           
                               </div>
                            
                            :null}
                            </div>     
                           
                           
                           </div>                    
                    :null

                    
                }

            
                </div>
               
                
                {this.state.invoiceRecords != null && this.state.canRefresh?
                   
                        this.state.invoiceRecords.length>0?
                            <div className="container">
                                <div className="row table-dark">
                                <div className="col">
                                        #
                                    </div> 
                                    <div className="col">
                                        Download
                                    </div> 
                                    <div className="col">
                                        Parent
                                    </div>
                                    <div className="col">
                                        Created
                                    </div>
                                    <div className="col">
                                        Sent
                                    </div>
                                    <div className="col">
                                        Payment
                                    </div>
                                    <div className="col">
                                        Total
                                    </div>    
                                </div>    
                            
                            {this.state.invoiceRecords.map((ir,index)=>(
                                <div id={index}  className="row table-dark">
                                    <div className='col'>
                                            {index +1}
                                    </div>
                                <div className="col">
                                    <button className="btn btn-danger"
                                        onClick={()=>this.createInvoice3({_id:ir._id,firstName:ir.parent.firstName,lastName:ir.parent.lastName})}
                                    >create invoice</button>
                                        
                                    <hr></hr>
                                </div> 
                                <div className="col">
                                    {ir.parent.firstName + " " + ir.parent.lastName }
                                    {/* <ParentRow parent = {parent}/>  */}
                                </div> 
                              
                 
                                <div className="col">
                                    {ir.created>0? ir.created :<FontAwesomeIcon icon={faTimesCircle} color="red"  size="lg" /> }
                                </div> 
                                <div className="col">
                                    {ir.sent>0? ir.sent :<FontAwesomeIcon icon={faTimesCircle} /> }                               
                                </div>    
                                <div className="col">  
                                   <button className="btn btn-primary" disabled={ir.created == 0} onClick={(e)=>this.updatePayment(ir)} > {ir.paymentAmount? ir.paymentAmount:<FontAwesomeIcon icon={faTimesCircle}/>}</button>                               
                                </div>
                                <div className="col">
                                    {ir.total !=null ? ir.total:<FontAwesomeIcon icon={faTimesCircle} /> }

                                    
                                </div>  
                               

                                
                                </div>    
                            ))}
                            </div>
                        
                        :null
                :
                null
                }
              
                
    

                    
            </div>
        )
    }
}

export default InvoiceTable2