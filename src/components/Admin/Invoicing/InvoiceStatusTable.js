import {Component} from 'react'
import axios from 'axios'
import DatePicker from "react-datepicker";
import 'jspdf-autotable'
import jsPDF from 'jspdf'
import { css } from '@emotion/react'

Date.prototype.formatDDMMYYYY = function(){
    return (this.getDate() +"/"+ (this.getMonth() + 1)+ 
    "/" +  this.getFullYear());
}

const override = css`
  margin-left:-90px
`;


class InvoiceStatusTable extends Component {

    constructor(props){
        super(props)
        this.state ={
            data:null,
            students:null,
            parents:null,
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
            chosenPids:[],
            action:0,
            showPaymentModal:false,
            chosenInvoice:null,
            changeTo:null,
            redirectUrl:"/",
            modalPaidStatus:null,
            canRefresh:true,
            invoiceRecords:null,
            options :{ authorization: this.props.token,userid:this.props.userId } 
        }

    }

    componentDidMount = async () =>{
        await this.getAllStudents();
        await this.getAllParents();
     
    }

    setInvoiceType = async  (e) =>{
        console.log(e.target.value);
        await this.getAllStudents();
        this.setState({invoiceType:e.target.value})
        await this.setState({mapCreated:false})
        await this.setState({treeCreated:false})
        await this.setState({isListPrepared:false})
        await this.setState({dataTree:{parents:[]}})
        await this.setState({chosenPids:[]})
        await this.setState({specificStudents:[]})
      
    }

   getSpecificStudents = async () =>{

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

        if(this.state.fromDate != null && this.state.toDate != null){
            await  axios.get('/api/taken-lessons/invoice-students?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()        ,
                {headers:this.state.options})
            .then(async (response) =>{
                console.log(response.data)
                students = await response.data
            
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
        await  axios.get('/api/invoices/invoice-by-student?fromDate='+this.state.fromDate.toString()+'&toDate='+this.state.toDate.toString()+'&'+idsString        ,
            {headers:this.state.options})
        .then(async (response) =>{
            console.log(response.data)
            students = await response.data
        
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
        await  axios.get('/api/students/all',
            {headers:this.state.options})
        .then(response=>{
            console.log(response.data)
            this.setState({students:response.data})
        })
    }

    getAllParents = async () =>{
        await  axios.get('/api/parents/all',
            {headers:this.state.options})
        .then(response=>{
            
            this.setState({parents:response.data})
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
  

    createMap = async () =>{
        var parentsMap = await new Map()
        await this.state.students.map((student)=>{
            if(!parentsMap.has(student.parent._id)){
                parentsMap[student.parent._id] = [student]
            }else{
                parentsMap[student.parent._id].push(student)
            }
        })
         
        await this.setState({parentsMap:parentsMap})
        await this.setState({mapCreated:true})
    }
    
    getInvoices = async (month,year) =>{
        var invoices = []
        await  axios.get('/api/invoices/query?month='+month+'&year='+year,
        {headers:this.state.options})
                    .then(async (response) =>{
                        invoices = await response.data
                                            
                    }) 
        return invoices

    }


    createDataTree = async () =>{

        var month = this.state.toDate.getMonth()+1
        var year = this.state.toDate.getFullYear();

        var invoices = await this.getInvoices(month,year)
        

        await this.setState({dataTree:{parents:[]}})   
        await this.createRedirectUrl();
        if(this.state.fromDate < this.state.toDate){
            
       
             
        var dataTree = await  this.state.dataTree
        Object.keys(this.state.parentsMap).map((pid,i) => {
            var parent = Object.assign({},this.state.parentsMap[pid][0].parent) 
            //var students = this.state.parentsMap[pid].concat()
            
           
            // parent.students = []
            // students.map(async (student,index)=>{
                
            //    var takenLessons = await this.getTakenLessonForStudent(student)             
               
            //    student.parent = null
            //    student.takenLessons = takenLessons
            //    parent.students.push(student)
            // })
            

            dataTree.parents.push(parent)           

                  
    })  
        
        this.setState({treeCreated:true})
        this.setState({dataTree:dataTree})
        }else{

            alert('dates error')
        }
        var parents = dataTree.parents;

        //console.log(parents);      

        await parents.map((parent,index)=>{
            var invoice = invoices? invoices.filter(a=>a.parent._id == parent._id) :[] 

            if(invoice[0] != null)
            {
                invoice[0].data = null
                invoice[0].parent = null 
            }           

            parent.invoice = invoice.length>0?invoice[0]:null                      

            
        })   
        
        console.log(dataTree)
        await this.setState({dataTree:dataTree})
        



        
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

        if(this.state.invoiceType != null){

            switch(parseInt(this.state.invoiceType)) {
                
                case 0:                    
                    var invoiceRecords = await this.getStudentsWhoHaveLessonsInDatesRangeOnly();
                    await this.setState({invoiceRecords:invoiceRecords})
                    this.setState({isListPrepared:true})
                  break;
                case 1:
                    var invoiceRecords = await this.getInvoicesByStudent()
                    await this.setState({invoiceRecords:invoiceRecords})
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
            await this.storeInvoice(ir._id)
        })
    }

    createInvoicesForNotCreated = async () =>{
        var data = await this.state.invoiceRecords.filter((ir)=>ir.invoices[0] == null) 
        data.map(async(ir,index)=>{
            await this.storeInvoice(ir._id)
        })

    }

    sendInvoicesForAllRecords = async () =>{
        var data = await this.state.invoiceRecords.filter(ir=>ir.invoices[0] != null)
        var invoices = await data.map(ir=>ir.invoices[0])
        await this.sendInvoices(invoices);

    }

    sendInvoiceForNotSent = async (e) =>{
        var irs = await this.state.invoiceRecords.filter(ir=>ir.invoices[0] != null)
        var data = await irs.filter(ir=>ir.invoices[0].sent == false)
        var invoices = await data.map(ir=>ir.invoices[0])
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
            var ids = invoices.map(a=> a._id)

            console.log(ids)

            var idsString = "";

            ids.map((id,index)=>{
                idsString = idsString + '&ids='+ id.toString()
            })


            await  axios.get('/api/invoices/send?'+idsString,
                    {headers:this.state.options})
                .then(async (response) =>{
                    var res = await response.data
                    console.log(res)
                
                })
        }



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


    createInvoice = async (parent) =>{

        const students = await this.getStudentsFromParent(parent._id);

        const studs =  students.map(async(student,index)=>{
            var lessons = await  this.getTakenLessonForStudent(student._id)
            
            student.takenLessons = await lessons
        })

        const numFruits = await Promise.all(studs)
        var height = 10
        var doc = await new jsPDF()
       await doc.text('', 10, height)
        height+=10;
       await doc.text('CHEQUES PAYABLE TO:', 10, height)
        height+=10;
       await doc.text('ELECTRONIC PAYMENTS TO:', 10, height)
        height+=10;
       await doc.text('Parent Name '+parent.firstName, 10, height)
            await students.map((student,index)=>{
                height += 10;
                doc.text('Student '+student.firstName, 10, height)
                var data = []
                var total = 0;
                    student.takenLessons.map((lesson,index)=>{
                        height += 5;
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
                    doc.text('Fee For Month £'+total.toString(), 50, 20)
            })
            

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
                    Invoice status Table
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

            </div>
        </div>

              )
    }
}

export default InvoiceStatusTable