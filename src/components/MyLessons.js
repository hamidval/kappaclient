import react,{Component} from 'react'
import DatePicker from "react-datepicker";
import axios from 'axios'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Bar } from 'react-chartjs-2';
///keep this import
import Chart from 'chart.js/auto';
Date.prototype.formatDDMMYYYY = function(){
    return (this.getDate() +"/"+ (this.getMonth() + 1) + 
    "/" +  this.getFullYear());
}

Date.prototype.formatDDMMYYYYWithDashes = function(){
    return (this.getDate() +"-"+ (this.getMonth() + 1) + 
    "-" +  this.getFullYear());
}


export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Past Monthly Earnings'
      }
    }
  };
  
  const labels = ['June', 'July','August', 'Spetember', 'October'];
  
  var data = {
    labels,
    datasets: [
      {
        label: 'pay',
        data: [0,0,0,0],
        backgroundColor: '#0066ff',
      }
    ],
  };
class MyLessons extends Component {

    constructor(props){
        super(props)
        this.state = {
            fromDate:null,
            toDate:null,
            takenLessons:null,
            takenLessonsCopy:null,
            isResults:false,
            subtotal:null,
            lessonToDelete:null,
            lessonToDeleteId:null,
            justSaved:false,
            minDate:null,
            maxDate:null,
            searchTerm:null,
            hours:1,
            earningsPerHour:0,
            data: data,
            options :{ authorization: this.props.token,userid:this.props.userId }   
        }
    }

    componentDidMount = async () =>{
        await this.setMinMaxDates()
    }

    setMinMaxDates = async () =>{
        var date = new Date()        
        
        var maxMonth = date.getMonth()
        if(date.getDate() >= 27){ // 27 is cut off date
            maxMonth++;
        }
        var minMonth = maxMonth == 1? 12: maxMonth - 1

        var maxYear = date.getFullYear();
        var minYear = maxMonth == 1? maxYear -1 : maxYear

        await this.setState({maxDate:new Date(maxYear,maxMonth,26)})
        await this.setState({minDate:new Date(minYear,minMonth,26)})
        await this.setState({toDate:new Date(maxYear,maxMonth-1,25)})
        await this.setState({fromDate:new Date(minYear,minMonth-1,26)})
           
       
        
      
    }

    getLessons = async () =>{
        console.log(this.props.id)
        var config = await this.props.data.config
        var startDate = (new Date(this.state.fromDate)).formatDDMMYYYYWithDashes()
        var endDate = (new Date(this.state.toDate)).formatDDMMYYYYWithDashes()
        await  axios.get('/api/taken-lesson/between/'+this.state.fromDate.toUTCString()+'/'+ this.state.toDate.toUTCString()+'/1', config)
        .then(response=>{

        console.log(response.data)

           
            this.setState({takenLessons:response.data})
            this.setState({takenLessonsCopy:response.data})
            this.calculateSubtotal(response.data);
            this.setState({isResults:true})

        })
    }

    search = (e) =>{
        if(this.state.fromDate != null && this.state.toDate != null){
            if(this.state.fromDate<this.state.toDate){
                this.getLessons()
                //this.stats()
            }else{
                alert('cannot query between these dates');
            }
        }else{
            alert('enter dates')
        }
    }

    calculateSubtotal = (lessons) =>{
        if(lessons != null){
            var subtotal  = 0;

            lessons.map((lesson,index)=>{
                var ppl = lesson.totalPay;
                subtotal = subtotal +ppl
            })
            
         
            this.setState({subtotal:subtotal})
            this.setState({earningsPerHour: subtotal/this.state.hours})

        }else{
            this.setState({subtotal:null})
        }
    }
    toggleModal = () =>{
        
        this.setState({showModal:!this.state.showModal})
    }
    deleteLesson = async () =>{
        this.toggleModal()
        console.log()
        await axios.delete('/api/taken-lessons/delete?id='+this.state.lessonToDeleteId,{headers:this.state.options})
        .then(response =>{
            console.log(response)
        })

        this.setState({justSaved:true})
                
                setTimeout(()=>
                    this.setState({justSaved:false})
                , 3000);

        this.search();
      
    }

    setLesson = (e,id)=>{
        this.setState({lessonToDeleteId:id})
        this.toggleModal()
    }

    setHours=(e)=>
    {
        let hours = e.target.value
        this.setState({hours: hours})
    }

    stats = async ()=>
    {
        await axios.get('/api/v2/lessons/teacher/'+this.props.id.toString()+'/pastmonthsearnings',{headers:this.state.options})
        .then(response =>{
            
            var stats = response.data

            var list = [stats.june[0].amount, stats.july[0].amount, stats.august[0].amount, stats.september[0].amount, stats.october[0].amount]

            var data = {
                labels,
                datasets: [
                  {
                    label: 'pay',
                    data: list,
                    backgroundColor: '#0066ff',
                  }
                ],
              };

            this.setState({data:data})
            
            
        }) 
    }
    filter = (e) =>{
        var searchTerm = e.target.value
        searchTerm = searchTerm.toLowerCase();
        console.log(this.state.takenLessonsCopy)
        var list = this.state.takenLessonsCopy.filter((item)=>
            
                item.studentFirstName.toLowerCase().includes(searchTerm) ||

                item.lessonDate.includes(searchTerm) 


            
                )
        this.setState({takenLessons:list})
       
    }

    render(){
        return (
            <div id="MyLessons" >
            <div id="MyLessonsContainer" className="container">
                <h1 className="m-3 mb-5">My Lessons</h1>

                {
                    this.state.justSaved?
                        <div class="alert alert-success" role="alert">
                            Changed saved!
                        </div>
                    :null
                }       
             
              
                    <div className="mb-3">
                        <div className="mt-5 pt-5">                        
                            <div class="form-group">
                                <div className='d-inline-block label-text'>
                                    <label ><h4 class="text">From : </h4> </label>
                                </div>
                                <div className='d-inline-block'>
                                <DatePicker className="form-control"
                                    selected={this.state.fromDate}
                                    dateFormat="dd/MM/yyyy"
                                    onChange={date => this.setState({fromDate:date})}
                                    /> 
                                </div>                              
                            </div>
                            <div class="form-group">
                                <div class="d-inline-block label-text">
                                    <label ><h4 class="text">To : </h4> </label>
                                </div>
                                <div class="d-inline-block">
                                <DatePicker className="form-control"
                                    selected={this.state.toDate}
                                    dateFormat="dd/MM/yyyy"
                                    onChange={date => this.setState({toDate:date})}
                                    /> 
                                </div>                              
                            </div>
                               
                            <button className="btn btn-outline-primary mb-5 mt-3 search-btn"
                                onClick={this.search}
                            >Search
                            </button>
                                  
                                    
                                         
                </div>

                <div className="">
                {this.state.isResults?
                    <div>
                    <div className=' mb-5'>
                    {                    
                    this.state.subtotal?
                        <button className="btn btn-primary amount-btn" disabled={true} >{'£ '+ this.state.subtotal}</button>
                    :null
                    }            
                  
                    </div>
         
                        </div>
                   
                          :null}
                </div>

              

                </div>

                

      

                <div>
                {
                    this.state.isResults ?
                        <div className='lessons-chart mb-5'>
                            <Bar
                            options={options}
                            data={this.state.data}
                            />
                        </div>
                    :null               
                }
                {
                            this.state.isResults && this.state.takenLessons?
                            <div>
                            <div id="MyLessonsSearchBar" class="input-group mb-5">
                                <input onChange={(e)=>this.filter(e)} type="text" class="form-control" placeholder={"e.g. "+"hamid"+"... maths... saturday ... 2022-04-24 (TRY THIS NEW SEARCH FEATURE!!!)"} />
                          
                                </div>
                            </div> : null
                        }
                    {this.state.isResults?
                    
                        this.state.takenLessons?
                       
                            this.state.takenLessons.length > 0 ?                                  


                                <div>
                                  
                                    <table id="MyLessonsTable" className="table table-responsive table-light">
                                        <div>
                                        <thead>
                                            <th>
                                                Date
                                            </th>
                                            <th>
                                                Name
                                            </th>
                                            <th>
                                                Subject
                                            </th>
                                            <th>
                                                Correction
                                            </th>
                                            <th>
                                                RPH
                                            </th>
                                            <th>
                                                Hours
                                            </th>
                                            <th>
                                                PPL
                                            </th>
                                            {/* <th>
                                                Delete
                                            </th> */}

                                        </thead>
                                        <tbody>
                                           
                                           {this.state.takenLessons.map((item,index)=>(
                                               <tr>
                                                   <td>
                                                       {new Date(item.lessonDate).formatDDMMYYYY()}
                                                   </td>
                                                   <td>
                                                       {item.studentFirstName}
                                                   </td>
                                                   <td>
                                                       {item.subject}
                                                   </td>
                                                   <td>
                                                       {item.correction}
                                                   </td>
                                                   <td>
                                                       {item.rate}
                                                   </td>
                                                   <td>
                                                       {item.hours}
                                                   </td>
                                                   <td>
                                                       {item.totalPay}
                                                   </td>
                                                   {/* <td>
                                                       {new Date(item.date) <= this.state.maxDate && new Date(item.date) >= this.state.minDate?
                                                        <button className="btn btn-danger"
                                                        onClick={e=>this.setLesson(e,item._id)}
                                                       >x</button>
                                                       
                                                       
                                                       :
                                                       <button className="btn btn-danger"
                                                        disabled={true}
                                                       >x</button>
                                                       
                                                       
                                                       }

                                                        
                                                   </td> */}
                                               </tr>
                                           ))}

                                        </tbody>
                                        </div>
                                    </table>

                                </div>
                                    

                            :<div><button className="btn btn-warning" disabled={true}>No Lessons Found !</button></div>

                        :null
                        
                    :null}
                </div>

                <Modal isOpen={this.state.showModal} toggle={this.toggleModal} >
                        <ModalHeader >You are about to remove a lesson</ModalHeader>
                        <ModalBody>
                            
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.deleteLesson}>Remove Lesson</Button>{' '}
                            <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                
            </div>
            </div>
        )
    }

}

export default MyLessons