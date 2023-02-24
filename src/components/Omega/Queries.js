import react ,{Component} from 'react'
import axios from 'axios'
import MyLessons from './MyLessons';
import CsvDownload from 'react-json-to-csv'
import DatePicker from "react-datepicker";
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

class Queries extends Component{

    constructor(props){
        super(props)
        this.state = {
            missedInformedLessons:null,
            startDate: null,
            endDate: null,
            deleteTakenLessonStartDate: null,
            deleteTakenLessonEndDate: null,
            options :{ userid:this.props.userId }
           }
    }

    componentDidMount =  async ()=>{
  
    } 
    
    
    getMissedInformedLesson = async (e) =>{

        if(this.state.startDate == null || this.state.endDate == null){
            alert('null dates')
            return
        }

        var startDate = this.state.startDate
        var endDate = this.state.endDate;
        var nextDay = startDate;

        var lessons = []

        while(nextDay <= endDate)
        {
            await axios.get('/api/lessons/get-missed-informed-lessons?date='+nextDay,{headers:this.state.options})
            .then(async response => {
            
           await  lessons.push(response.data)
         
        });
            var nextDay = await nextDay.addDays(1)
        }
        var merged = await [].concat.apply([], lessons);
        await this.setState({missedInformedLessons: merged})
        console.log(merged)

        
    }

    updateTeacherTakenLessons = async (e) =>{
        var teacherId = "60f5f64b8711222d3891e3aa"
        var date = new Date(2022,1,26)
        await axios.get('/api/taken-lessons/update-taken-lessons?id='+teacherId+'&date='+date,{headers:this.state.options})
        .then(async response => {
        
      console.log(response.data)

        });  
    }

    runQuery = async (e) =>{
        var teacherId = "61c318094d7fdf07d1afc7b9"
        await axios.get('/api/lessons/add-new-attributes?id='+teacherId,{headers:this.state.options})
        .then(async response => {
        
       console.log(response.data)

        }); 
    }

    sendEmails = async (e)=>
    {
        await axios.get('/api/preinvoices/send-pre-invoice?id=635e64e83da386700ea8f2cc',{headers:this.state.options})
        .then(async response => {
        
      console.log(response.data)

        });  
    }

    deleteTakenLessons = async (e) =>{
        var lesson = {teacher:"",
        subject:"maths",
        correction:1,
        student:"",
        rateKey:"",
        rate:1,
        price:10,
        day:0,
        startDate:new Date(2022,10,1),
        endDate:new Date(2022,10,1),
        isCoverLesson:true,
        fadj:1,
        padj:4,
        groupRate: 2,
        groupPrice:2,
        groupRateKey:"djh",
        singleRate:3,
        singlePrice:1,
        singleRateKey:"",
        lessonType:1}
        await axios.post('/api/taken-lessons/post-lesson',{headers:this.state.options, data: {lesson: lesson}})
        .then(async response => {
        
       
        }); 
    } 



    render(){
        return(
            <div className="container">
                <h1>Queries </h1>

                <table className="table table-responsive table-light">
                        <thead>
                            <th>
                                <tr>Query Name</tr>
                            </th>
                            <th>
                                <tr>start date</tr>
                            </th>
                            <th>
                                <tr>end date</tr>
                            </th>
                      
                        
                
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    missed informed lessons
                                </td>
                                <td>
                                <DatePicker placeholderText="pick a date.." className="form-control"
                                        dateFormat="dd/MM/yyyy"
                                    
                                        selected={this.state.startDate}
                                        onChange={date => this.setState({startDate:date})} />  
                                </td>
                                <td>
                                <DatePicker placeholderText="pick a date.." className="form-control"
                                        dateFormat="dd/MM/yyyy"
                                   
                                        selected={this.state.endDate}
                                        onChange={date => this.setState({endDate:date})}
                                         />  
                                </td>
                                <td>
                                    <button className='btn btn-success' onClick={this.getMissedInformedLesson}>Run</button>
                                </td>
                             
                                <td>
                                {this.state.missedInformedLessons?
                                <button className='btn btn-primary' ><CsvDownload data={this.state.missedInformedLessons} /></button>
                                :"no data"}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    update taken lessons
                                </td>
                                <td>
                                    enter teacher Id
                                </td>
                                <td>
                                    <button className='btn btn-success' onClick={this.updateTeacherTakenLessons} >Run</button>
                                </td>                             
                                <td>
                                    Done
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    update all lessons with new attributes
                                </td>
                                <td>
                                    enter teacher Id
                                </td>
                                <td>
                                    <button className='btn btn-success' onClick={this.runQuery} >Run</button>
                                </td>                             
                                <td>
                                    Done
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    post taken lesson
                                </td>
                              
                                <td>
                                    <button className='btn btn-success' onClick={this.deleteTakenLessons} >Run</button>
                                </td>                             
                                <td>
                                    Done
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    send a few emails to personal email
                                </td>
                              
                                <td>
                                    <button className='btn btn-success' onClick={this.sendEmails} >Run</button>
                                </td>                             
                                <td>
                                    Done
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div>
                        {
                            this.state.teacherToHackId?
                            <MyLessons id={this.state.teacherToHackId} userId={this.state.teacherToHackUserId} />
                         
                            :null
                        }
                    </div>
                
            </div>
        )
    }
}

export default Queries