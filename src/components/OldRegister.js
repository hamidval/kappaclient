import React,{Component} from 'react'
import DatePicker from "react-datepicker";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter,Tooltip } from 'reactstrap';
import AllLessonsRow from './AllLessonsRow'
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import qs from 'qs'
import Corrections from './Enums/Corrections';
import Subjects from './Enums/Subjects';
import {getDateData} from '../Helper'
import BaseComponent from './BaseComponent';

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
class Register extends BaseComponent {


    constructor(props){
        super(props)
        this.toggle = this.toggle.bind(this);
        this.state = {
            data:null,
            extraLessons:[],
            extraEnteredLessons:[],
            chosenDate:null,
            justExtra: false,
            justExtraBtnMsg: "only extra lessons",
            showRegularLessonModal:false,
            showExtraLessonModal:false,
            regularLessonModalIndex:null,
            extraLessonModalIndex:null,
            allLessons:null,
            filteredAllLessons:[],
            searchString:null,
            extraLesson:null,
            studentNotOnList:false,
            teacherId:null,
            showSaveModal:false,
            justSaved:false,
            noChanges:false,
            minDate:null,
            maxDate:null,
            changesSaved:false,
            changedNotSaved:false,
            tooltipOpen: false,
            error: false,
            errorMessage: null,
            modalError: false,
            modalErrorMessage: null,
            matches: window.matchMedia("(min-width: 768px)").matches,
            options :{userid:this.props.userId }
            
        }
    }

    componentDidMount = async ()=>{     


    
        var queryString = qs.parse(window.location.search, { ignoreQueryPrefix: true })
        var date = queryString.date? queryString.date : null
        if(date != null){
            var dateString =date;
            var splitDate = dateString.split('/');
            var month = splitDate[1] - 1; //Javascript months are 0-11

            var date = new Date(splitDate[2], month, splitDate[0]);

            if(Object.prototype.toString.call(date) === "[object Date]"){
                this.setDate(new Date(date))
             }
        }
        var date = new Date();
        await this.setState({teacherId:this.props.data.id})
        await this.setState({options: {userid:this.props.userId}})
        await this.setDate(date)      
    
        await this.setMinMaxDates();

        
    }
    setMinMaxDates = async () =>{
        var date = new Date()       

        var maxMonth = date.getMonth()
        if(date.getDate() > 27){ // 27 is cut off date
            maxMonth++;
        }
        var minMonth = maxMonth == 1? 12: maxMonth - 1

        var maxYear = date.getFullYear();
        var minYear = maxMonth == 1? maxYear -1 : maxYear
        
        this.setState({maxDate:new Date(maxYear,maxMonth,27)})
        this.setState({minDate:new Date(minYear,minMonth,26)})
       

      
    }

    addExtraLesson = async (lesson) =>{
    
        if(lesson != null){
            lesson.hours = 1
            this.setState({extraEnteredLessons:this.state.extraEnteredLessons.concat(lesson)})
            this.toggleExtraLessonModal()
        }else{
            
            
            this.setState({modalErrorMessage: "Lesson Not Chosen"})
            this.triggerModalErrorMessage();
            

        }
    }

    triggerErrorMessage = () =>{
        this.setState({error: true})
        setTimeout(()=>{
            this.setState({error:false})
            this.setState({errorMessage: null})
            
            
        }
        , 3000);
        
    }

    triggerModalErrorMessage = () =>{
        this.setState({modalError: true})
        setTimeout(()=>{
            this.setState({modalError:false})
            this.setState({modalErrorMessage: null})
            
            
        }
        , 3000);
        
    }


    updateCorrection = (e,index,isExtraLesson = false,isExtraEntered = false) =>{
        var item = null;
        
        item = this.state.extraEnteredLessons[index]     

        item.correction = parseInt(e.target.value);
        
        if(item.correction != item.prevCorrection){
            item.updateCorrection = true  
          
        }

  
        this.setState({data:this.state.data})

       
    }

    updateLessonType = (e, index, isExtraLesson = false, isExtraEntered = false) =>{
        var item = null;
        
     
            item = this.state.extraEnteredLessons[index]

        var lessonType = parseInt(e.target.value)      
       

        if(lessonType == 0){
             item.price = item.groupPrice
             item.rateKey = item.groupRateKey
             item.rate = item.groupRate
             item.actualLessonType = 0
   
        }else if(lessonType == 1){
            item.price = item.singlePrice
            item.rateKey = item.singleRateKey
            item.rate = item.singleRate
            item.actualLessonType = 1
        }

        item.updateLessonType = true;
        
        this.setState({data:this.state.data})

       
    }
    updateHours = async (e,index,isExtraLesson = false,isExtraEntered = false) =>{
        var hours = e.target.value;
       
        if(hours == ""){
            hours = parseInt(0);
        }
        
       
        var item = this.state.extraEnteredLessons[index]
   
        item.hours = await  hours;

       
        if(item.hours != item.prevHours){
            item.updateHours = true
          
        }
        
        this.setState({data:this.state.data})
    }

    updateTakenLessonCorrection = async (id,correction)=>{

        await  axios.post('/api/taken-lessons/update-correction?userId='+
        this.props.userId+'&id='+id+'&c='+correction,{headers:this.state.options})
        .then(response=>{
                  
        })
    }
    updateTakenLessonHours = async (id,hours) => {        
        
        await  axios.post('/api/taken-lessons/update-hours?userId='+
        this.props.userId+'&id='+id+'&h='+hours,{ headers:this.state.options })
        .then(response=>{
         
           
        })
    }
    createTakenLesson = async (item, isExtra = false)=>{  
        if(parseFloat(item.hours) != 0){

    
        var options =  { authorization: this.props.token,
            userid:this.props.userId }
            var teacherId = item.teacher
            var subject = item.subject;
            var correction = item.correction
            var studentId = item.student._id
            var rateKey = item.rateKey;
            var rate = item.rate;
            var price  = item.price;
            var hours = item.hours;
            var date = this.state.chosenDate;
            var discount = item.student.discount;
            var day = item.day;        
         
        
                var url = await '/api/taken-lessons?userId='+
                this.props.userId+'&tid='+teacherId+
                '&s='+subject+
                '&rkey='+rateKey+
                '&day='+day+
                '&sid='+studentId+
                '&p='+price+
                '&c='+correction+
                '&h='+hours+
                '&rate='+rate+
                '&da='+date+
                '&di='+discount+
                '&slt='+item.setLessonType+
                '&alt='+item.actualLessonType+
                '&ie='+isExtra;
           
         if(item.correction != 3){  /// 3 = ignore     
            await axios.post(url,{headers:options})
             .then(response =>{
                 
            })
 
        }
    }
    }
    deleteTakenLesson = async (lesson) =>{
       
        await axios.delete('/api/taken-lessons?userId='+
        this.props.userId+'&id='+lesson.takenId)
        .then(response =>{
         
        })

    }

    updateTakenLessonType = async (lessonId, takenLessonId, lessonType) =>{

    
        var apiStr = '/api/taken-lessons/update-lesson-type?userid='+this.props.userId+'&id='+lessonId.toString()+'&tid='+takenLessonId.toString()+'&type='+lessonType.toString()
    
        await axios.post(apiStr,{headers:this.state.options})
        .then(response =>{
          
        })
    }
    checkFormat = (data) =>{
       
                var formatValues = data.map(lesson=> parseFloat(lesson.hours) != null)
               
                if(formatValues.includes(false)){
                    return false
                }else{
                    return true
                }
 
    }

    checkIfDataNeedsUpdate = (data)=>{

        var formatValues = data?.map(lesson=> lesson.updateCorrection == true || lesson.updateHours == true || lesson.updateLessonType == true)
        
        if(formatValues?.includes(true)){
            return true
        }else{
            return false
        }

    }

    checkChangesNotSaved = async () =>{        

        var needsUpdate_regular = await this.checkIfDataNeedsUpdate(this.state.data) 
        var needsUpdate_ExtraEntered = await this.checkIfDataNeedsUpdate(this.state.extraEnteredLessons);
        var needsUpdate_Extra = await this.state.extraLessons.length > 0
        var hasChanges = (needsUpdate_regular || needsUpdate_ExtraEntered || needsUpdate_Extra)&&this.state.chosenDate != null
        return hasChanges && !this.state.changesSaved
    } 
    
    saveAndUpdate = async (e) =>{


        console.log(this.state.extraEnteredLessons)
       
        var obj = {}
     
         obj.lessons = await this.state.extraEnteredLessons.map((lesson, index) => {
            var l = {
                    studentId: lesson.studentId,
                 hours: lesson.hours,
                 subject: lesson.subject,
                 yearGroup: lesson.yearGroup,
                 singleFee: lesson.singleFee,
                 singlePay: lesson.singlePay,
                 groupFee: lesson.groupFee,
                 groupPay: lesson.groupPay,
                 lessonType: lesson.lessonType
                }
            return l
        })

        
        obj.TeacherId = this.state.teacherId
       
        var date = new Date(this.state.chosenDate)
        obj.date = date
      
        
        await  axios.post('/api/taken-lesson/add', obj)
        .then(response=>{
            this.setState({justSaved:true})
                
           
            setTimeout(()=>{
                this.setState({justSaved:false})
                
                this.checkLessons()
                
            }
            , 3000);
        })
    }

    save = async () =>{

        var isCorrectFormatRegular = true;
        var isCorrectFormatExtra = true;
        var isCorrectFormatExtraEntered = true;

        var isRegularLessons = false;
        var isExtraLessons = false;
        var isExtraEnteredLessons = false;

        var regSaved = true;
        var extraSaved = true;
        var enteredExtraSaved = true;

        var needsUpdate_regular = await this.checkIfDataNeedsUpdate(this.state.data) 
        var needsUpdate_ExtraEntered = await this.checkIfDataNeedsUpdate(this.state.extraEnteredLessons);
        var needsUpdate_Extra = await this.state.extraLessons.length > 0




    if((needsUpdate_regular || needsUpdate_ExtraEntered || needsUpdate_Extra)&&this.state.chosenDate != null){

        this.setState({changesSaved:true})
        if(this.state.data != null){
            if(this.state.data.length > 0 ){
                isCorrectFormatRegular = await this.checkFormat(this.state.data)
                isRegularLessons = true
            }
        }

        if(this.state.extraEnteredLessons != null){
            if(this.state.extraEnteredLessons.length > 0 ){
                isCorrectFormatExtraEntered = await this.checkFormat(this.state.extraEnteredLessons)
                isExtraEnteredLessons = true
            }
        }

        if(this.state.extraLessons != null){
            if(this.state.extraLessons.length > 0 ){
                isCorrectFormatExtra = await this.checkFormat(this.state.extraLessons)
                isExtraLessons = true;
            }
        }


        if(isRegularLessons && needsUpdate_regular){

            if(isCorrectFormatRegular){

     
            var allLessons = this.state.data.filter((lesson)=>parseFloat(lesson.hours) > 0)
            var extraLessons = this.state.extraLessons
              
        //regular lessons
            allLessons.map((lesson,index)=>{
               
                //update
                if(lesson.delete == true && lesson.alreadyEntered){
                   
                    this.deleteTakenLesson(lesson)
                }else if(lesson.alreadyEntered != true){
                 
                    this.createTakenLesson(lesson)
                }else if(lesson.updateCorrection || lesson.updateHours || lesson.updateLessonType){
                    if(lesson.updateCorrection){
                        this.updateTakenLessonCorrection(lesson.takenId,lesson.correction)
                    }

                    if(lesson.updateHours){
                        this.updateTakenLessonHours(lesson.takenId,lesson.hours)
                    }

                    if(lesson.updateLessonType){
                      
                        this.updateTakenLessonType(lesson._id, lesson.takenId, lesson.actualLessonType)
                    }
                }
            
            })

                

            }else{
           
                alert('incorrect format, data not sent')
                regSaved = false;
            }

            
        }

        if(isExtraEnteredLessons && needsUpdate_ExtraEntered){
            if(isCorrectFormatExtraEntered){
                var allLessons = await this.state.extraEnteredLessons.filter((lesson)=>parseFloat(lesson.hours) > 0)        
    
                //regular lessons
                    allLessons.map((lesson,index)=>{
                        //update
                        if(lesson.delete == true && lesson.alreadyEntered){
                            
                            this.deleteTakenLesson(lesson)
                        }else if(lesson.alreadyEntered != true){
                            this.createTakenLesson(lesson)
                        }else if(lesson.updateCorrection || lesson.updateHours || lesson.updateLessonType){
                            if(lesson.updateCorrection){
                                this.updateTakenLessonCorrection(lesson.takenId,lesson.correction)
                            }
                            if(lesson.updateHours){
                                this.updateTakenLessonHours(lesson.takenId,lesson.hours)
                         
                            }
                            if(lesson.updateLessonType){
                                
                                this.updateTakenLessonType(lesson._id, lesson.takenId, lesson.actualLessonType)
                            }
                        }
                    
                    })


           

            }else{
            
                alert('incorrect format, data not sent')
                enteredExtraSaved = false;
            }
           
        }

        if(isExtraLessons && needsUpdate_Extra ){

            if(isCorrectFormatExtra){
              
                this.state.extraLessons.filter((lesson)=>parseFloat(lesson.hours) > 0).map((lesson)=>this.createTakenLesson(lesson));
            }else{           
                alert('incorrect format, data not sent')
                extraSaved = false;
            }
           
           
        }


        if(isRegularLessons || isExtraEnteredLessons || isExtraLessons){

            if(regSaved && extraSaved && enteredExtraSaved){

                this.setState({justSaved:true})
                
           
                setTimeout(()=>{
                    this.setState({justSaved:false})
                    this.setState({chosenDate:null})
                }
                , 3000);

            }

        }

        
    }else{

        this.setState({noChanges:true})
           
                setTimeout(()=>
                    this.setState({noChanges:false})
                , 3000);

    }        
}
    setDate = async (date) =>{
   
             await this.setState({chosenDate:date})

            await this.setState({dayOfWeek:date.getDay()})

           
            await this.checkLessons();
          
     
    }
   
    checkLessons = async ()=>{

    
        await this.setState({data:null})
        await this.setState({extraEnteredLessons:[]})
        await this.setState({extraLessons:null})
        await  this.setState({extraLessons:[]})
        
        var config = await this.props.data.config
        console.log(config)
        await  axios.get('/api/lesson/date/'+formatDate(this.state.chosenDate)
                        +'/'+this.state.teacherId, config)
            .then(response=>{
                var data = response.data              
                this.setState({data:null})
                this.setState({data:data})            
            })  


        var dateObj = getDateData(this.state.chosenDate)

        await  axios.get('/api/taken-lesson/get/'+this.state.teacherId
                     +'/'+formatDate(this.state.chosenDate))
        .then(response=>{
             var data = response.data          
             this.setState({extraEnteredLessons:null})   
             this.setState({extraEnteredLessons:data})        
        })
       

    }

    toggleJustExtra = async ()  =>{
        await this.setState({justExtra:!this.state.justExtra})
        if(this.state.justExtra){
            this.setState({justExtraBtnMsg:"only regular lessons"})
        }else{
            this.setState({justExtraBtnMsg:"only extra lessons"})
            
        }
    }

    removeRegularLesson = (e,index) =>{
                
        if (index > -1) {
            var lessons = this.state.data;
            lessons[index].delete = true
           

            this.setState({data:lessons})
          }

        if(this.state.showRegularLessonModal){
            this.setState({showRegularLessonModal:!this.state.showRegularLessonModal})
        }
        
    }

    removeExtraLesson = (e,index) =>{
                
        if (index > -1) {
            var lessons = this.state.extraLessons;
            lessons.splice(index)
        
            this.setState({extraLessons:lessons})
          }

        
    }

    toggleRegularLessonModal = (e,index) =>{
        this.setState({regularLessonModalIndex:index})
        this.setState({showRegularLessonModal:!this.state.showRegularLessonModal})
        

    }

    toggleExtraLessonModal = (e,index) =>{

        if(this.state.chosenDate == null){
            this.setState({errorMessage: "No date chosen"})
            this.triggerErrorMessage()            
            return
        }

        this.setState({extraLessonModalIndex:index})
        this.setState({showExtraLessonModal: !this.state.showExtraLessonModal})
        this.getAllTeacherStudents();

    }
    toggleChangesNotSavedModal  = (e) =>{
        this.setState({showNotSavedModel:!this.state.showNotSavedModel})
    }
  

    getAllTeacherStudents = async ()=>{
       
        var options =  { authorization: this.props.token,
            userid:this.props.userId }

           
            await axios.get('/api/lessons/teacher/notday?id='+this.props.id+'&day='+this.state.dayOfWeek+'&date='+this.state.chosenDate,
            { headers:options })
            .then(response =>{
            var lessons = response.data;
      
            this.setState({allLessons:lessons})
            this.setState({filteredAllLessons:lessons})


        })
    }
    setStudentSearch = (e)=>{
        var searchString = e.target.value? e.target.value : ""; 
        this.setState({searchString:searchString})
        var filtered = this.state.allLessons.filter((item,index)=>(
        
            item.student?.firstName.toLowerCase().includes(searchString.toLowerCase()) ||
            item.student?.lastName.toLowerCase().includes(searchString.toLowerCase())

        ))
        this.setState({extraLesson:null})
        this.setState({filteredAllLessons:filtered})

    }

    setSelected = (lesson) =>{
        this.setState({extraLesson:lesson})
    }

    toggle() {
        this.setState({
          tooltipOpen: !this.state.tooltipOpen
        });
    }

    addToTakenLessonList(e, index){
        var lesson = this.state.data[index];

        console.log(lesson)
        var takenLessons = this.state.extraEnteredLessons;
        console.log(takenLessons)
        lesson.hours = 1     

        takenLessons.push(lesson)
        this.setState({extraEnteredLessons: takenLessons})
    }

    removeFromTakenLessonList(e, index){
      
        var takenLessons = this.state.extraEnteredLessons
        takenLessons.splice(index,1)

        takenLessons.map((lesson, index)=>{
            let hours = lesson.hours
            lesson.hours = hours
        })
        this.setState({extraEnteredLessons: takenLessons})
        
        this.setState({extraEnteredLessons: this.state.extraEnteredLessons})
    }  
  
    
    render(){
        return(
            <div id="EnterDataContainer" >              
            

                {
                     this.state.error && this.state.errorMessage?
                     <div className="alert alert-danger" role="alert">
                         {this.state.errorMessage}                         
                     </div>
                 :null
                }

            
                {
                    this.state.justSaved?
                        <div className="alert alert-success" role="alert">
                            Changed saved!
                        </div>
                    :null
                }




                {
                    this.state.noChanges?
                        <div className="alert alert-danger" role="alert">
                            {this.state.chosenDate == null?
                            "no date chosen"
                            :"no changes made!"}
                            
                        </div>
                    :null
                }

                
                {
                    this.state.matches?
                    <div className="row mb-3 mt-3">
                    <div className="col-4" >

                        <div>
                            <div id="TooltipExample" className="mb-2">
                                <DatePicker placeholderText="pick a date.." className="form-control"
                                dateFormat="dd/MM/yyyy"
                                minDate={this.state.minDate?this.state.minDate:null}
                                maxDate={this.state.maxDate?this.state.maxDate:null}
                                selected={this.state.chosenDate}
                                onChange={date => this.setDate(date)}/>  

                            </div>                 

                        </div>

                    </div>

                    <div className="col-6">           
                        <div className='d-inline mb-1 mr-4'>
                            <button className="btn btn-outline-primary" onClick={this.toggleExtraLessonModal}>
                                    Add 
                            </button>
                        </div>

                        <div className='d-inline mb-3'  >
                            <button className="btn btn-outline-success"  onClick={this.saveAndUpdate}>
                                    Save
                            </button>                    
                        </div>
                    </div>
                </div>
:
                <div className="row mb-3 mt-3">
                    <div className="col" >

                        <div>
                            <div id="TooltipExample" className="mb-2">
                                <DatePicker placeholderText="pick a date.." className="form-control"
                                dateFormat="dd/MM/yyyy"
                                minDate={this.state.minDate?this.state.minDate:null}
                                maxDate={this.state.maxDate?this.state.maxDate:null}
                                selected={this.state.chosenDate}
                                onChange={date => this.setDate(date)}/>  

                            </div>                 

                        </div>

                    </div>

                    <div className="col">           
                        <div className='d-inline mb-1 mr-2'>
                            <button className="btn btn-outline-primary" onClick={this.toggleExtraLessonModal}>
                                    Add
                            </button>
                        </div>

                        <div className='d-inline mb-3'  >
                            <button className="btn btn-outline-success"  onClick={this.saveAndUpdate}>
                                    Save
                            </button>                    
                        </div>
                    </div>
                </div>

                }
               

          
                
                <div class={"row "+  (this.state.matches? "margin": "")}>
                    <div class="col-5 lesson-list">
                        <table id="EnterDataTable" className=" table">
                            <thead>
                                <tr >
                                    <th >
                                        Name
                                    </th>
                                    <th   >
                                        Subject
                                    </th>
                                    <th   >
                                        -
                                    </th>                             
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.data?
                                    this.state.data.map((item,index)=>(
                                        <tr>
                                            <td>{item.studentFirstName}</td>
                                            <td>{Subjects[item.subject]}</td>
                                            <td><button className='btn btn-success' onClick={(e)=>this.addToTakenLessonList(e,index)}>+</button></td>
                                        </tr>
                                    ))
                                :null}                  
                            </tbody>
                        </table>
                    </div>
                    <div class="col">
                        <table id="EnterDataTable" className=" table table-responsive table-responsive-otter">
                            <thead>
                               
                                    <th class="col-3">
                                        Name
                                    </th>
                                    <th  class="col-1" >
                                        Subject
                                    </th>
                                    <th className="type-col">
                                        Type
                                    </th>
                                    <th className='type-col'  >
                                        -
                                    </th>
                                    <th class="type-col"  >
                                        Hours
                                    </th>  
                                    <th class="col-1">
                                        -
                                    </th>                            
                              
                            </thead>
                            <tbody>
                                {this.state.extraEnteredLessons?
                                    this.state.extraEnteredLessons.map((item,index)=>(
                                        <tr>
                                            <td>{item.studentFirstName}</td>
                                            <td>{Subjects[item.subject]}</td>
                                            <td >
                                                <div className="form-group type-col">                                        
                                                    <select defaultValue={item.alreadyEntered? item.actualLessonType :item.rateKey?.charAt(1) == "G"? 0:1} className="form-control" onChange={(e)=>this.updateLessonType(e,index,false)}>
                                                                                        
                                                    <option value={0} >G</option>
                                                    <option value={1} >1</option>
                                                    </select>                                                 
                                                
                                                </div>
                                            </td>
                                            <td  >
                                            <div className="form-group type-col">
                                            
                                                <select defaultValue={item.correction} className="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.updateCorrection(e,index,false)}>
                                                                                
                                                                        {Corrections?
                                                                        
                                                                        
                                                                            Corrections.map((item,index)=>(
                                                                                <option key={index} value={index} >{item?.toUpperCase().charAt(0)}</option>
                                                                            ))
                                                                        :
                                                                        <option>error</option>
                                                                        }
                                                </select>                      
                                            </div>                                            
                                            </td>
                                        <td id="hours">
                                            <input key={index} type="number"  maxLength="3" className="form-control type-col"  defaultValue={item.hours?item.hours:null} style={item.prevHours != item.hours? {background:'lightgreen'} :null} onChange={(e)=>{this.updateHours(e,index)}}/>
                                        </td>
                                        <td>
                                            <button className='btn btn-danger' onClick={(e)=>this.removeFromTakenLessonList(e,index)}>x</button></td>
                                        </tr>
                                    ))
                                :null}                   
                            </tbody>
                        </table>
                    </div>
                </div>           
                   
                    <Modal isOpen={this.state.showRegularLessonModal} toggle={this.toggleRegularLessonModal} >
                        <ModalHeader >You are about to remove a lesson</ModalHeader>
                        <ModalBody>
                           the lesson will be removed for today, to remove permenantly please contact an admin, providing the student's name and subject
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={(e)=>this.removeRegularLesson(e,this.state.regularLessonModalIndex)}>Remove Lesson</Button>{' '}
                            <Button color="secondary" onClick={this.toggleRegularLessonModal}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.showExtraLessonModal} toggle={this.toggleExtraLessonModal} >
                        <ModalHeader >You are about to add an extra lesson</ModalHeader>
                        <ModalBody>
                        {
                            this.state.modalError && this.state.modalErrorMessage?
                            <div className="alert alert-danger" role="alert">
                                {this.state.modalErrorMessage}                         
                            </div>
                        :null
                        }

                       
                        <label for="inputEmail4">Student</label>
                        <input value={this.state.extraLesson?this.state.extraLesson.student?.firstName +" ":null} className="form-control" onChange={this.setStudentSearch} placeholder="search for students ..."/>
                        <div id="AddExtraLessonModal" class="mb-3 mt-3">
                            <Button color="primary" onClick={(e)=>this.addExtraLesson(this.state.extraLesson)}>Add Extra Lesson</Button>{' '}
                            <Button color="secondary" onClick={this.toggleExtraLessonModal}>Cancel</Button>
                        </div>

                        
                        <div className="col" style={{cursor:'pointer'}}
                         size={this.state.filteredAllLessons?.length} onChange={this.setStudent}  style={{display:this.state.showStudentList}}>
                            
                            {this.state.filteredAllLessons != null?this.state.filteredAllLessons.map((item,index)=>(

                                
                               <AllLessonsRow
                                item={item}
                                index={index}
                                key={index}
                                addExtraLesson = {this.addExtraLesson}
                                setSelected = {this.setSelected}
                               />

                            )):null}
                        </div> 

                        </ModalBody>
                        <ModalFooter>
                            
                        </ModalFooter>
      
                    </Modal>               

            </div>
        )
    }
}

export default (Register);