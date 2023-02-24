import React,{Component} from 'react'
import DatePicker from "react-datepicker";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter,Tooltip } from 'reactstrap';
import AllLessonsRow from '../AllLessonsRow'
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import qs from 'qs'
import Corrections from '../Enums/Corrections';
import { css } from "@emotion/react";
import Loader from "react-spinners/BeatLoader";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
class EnterData extends Component{


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
            options :{ userid:this.props.userId }
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
        
        await this.setState({teacherId:this.props.id})
        await this.setMinMaxDates();

        
    }
    setMinMaxDates = async () =>{
        var date = new Date()       
        
        var maxMonth = date.getMonth()
        if(date.getDate() >= 25){ // 27 is cut off date
            maxMonth++;
        }
        var minMonth = maxMonth == 1? 12: maxMonth - 1

        var maxYear = date.getFullYear();
        var minYear = maxMonth == 1? maxYear -1 : maxYear
        
        this.setState({maxDate:new Date(maxYear,maxMonth,26)})
        this.setState({minDate:new Date(minYear,minMonth,26)})
       

      
    }

    addExtraLesson = async (lesson) =>{

        if(lesson != null){
        this.setState({extraLessons:this.state.extraLessons.concat(lesson)})
        this.toggleExtraLessonModal()
        }
    }


    updateCorrection = (e,index,isExtraLesson = false,isExtraEntered = false) =>{
        var item = null;
        
        if(isExtraEntered){
            item = this.state.extraEnteredLessons[index]
        }
        else if(!isExtraLesson){
            item = this.state.data[index]
            
        }else{
            item = this.state.extraLessons[index];
           
        }

        item.correction = parseInt(e.target.value);
        
        if(item.correction != item.prevCorrection){
            item.updateCorrection = true  
          
        }

  
        this.setState({data:this.state.data})

       
    }

    updateLessonType = (e,index,isExtraLesson = false,isExtraEntered = false) =>{
        var item = null;
        
        if(isExtraEntered){
            item = this.state.extraEnteredLessons[index]
        }
        else if(!isExtraLesson){
            item = this.state.data[index]
            
        }else{
            item = this.state.extraLessons[index];           
        }
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
        console.log(hours)
        if(hours == ""){
            hours = parseInt(0);
        }
        var item = null
        if(isExtraEntered){
            item = this.state.extraEnteredLessons[index]
        }
        else if(!isExtraLesson){
            item = this.state.data[index]
            
        }else{
            item = this.state.extraLessons[index];
        }
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
                     console.log(response)
        })
    }
    updateTakenLessonHours = async (id,hours) => {        
        
        await  axios.post('/api/taken-lessons/update-hours?userId='+
        this.props.userId+'&id='+id+'&h='+hours,{ headers:this.state.options })
        .then(response=>{
         
            console.log(response)
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
                 console.log(response.data)
            })
 
        }
    }
    }
    deleteTakenLesson = async (lesson) =>{
       
        await axios.delete('/api/taken-lessons?userId='+
        this.props.userId+'&id='+lesson.takenId)
        .then(response =>{
            console.log(response)
        })

    }

    updateTakenLessonType = async (lessonId, takenLessonId, lessonType) =>{
        var apiStr = '/api/taken-lessons/update-lesson-type?userid='+this.props.userId+'&id='+lessonId.toString()+'&tid='+takenLessonId.toString()+'&type='+lessonType.toString()
    
        await axios.post(apiStr,{headers:this.state.options})
        .then(response =>{
            console.log(response)
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
                        console.log("lesson type updated 1",lesson)
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
                            console.log('here')
                            this.deleteTakenLesson(lesson)
                        }else if(lesson.alreadyEntered != true){
                            this.createTakenLesson(lesson)
                        }else if(lesson.updateCorrection || lesson.updateHours || lesson.updateLessonType){
                            if(lesson.updateCorrection){
                                this.updateTakenLessonCorrection(lesson.takenId,lesson.correction)
                            }
                            if(lesson.updateHours){
                                this.updateTakenLessonHours(lesson.takenId,lesson.hours)
                                console.log(lesson)
                            }
                            if(lesson.updateLessonType){
                                console.log("lesson type updated 2")
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
            console.log(this.state.chosenDate)
     
    }
   
    checkLessons = async ()=>{

        var options =  {
            userid:this.props.userId }
     

            await this.setState({data:null})
            await this.setState({extraEnteredLessons:null})
           await this.setState({extraLessons:null})
           await  this.setState({extraLessons:[]})

        await  axios.get('/api/lessons/get-teacher-lessons?userId='+
                            this.props.userId+'&tid='+this.state.teacherId
                        +'&date='+this.state.chosenDate,{headers:options})
            .then(response=>{
                var data = response.data
                console.log(data.filter(x=> x.student == null),"hello")
                this.setState({data:null})
                this.setState({data:data})

            
            })  

        await  axios.get('/api/lessons/get-teacher-taken-lessons?userId='+
                        this.props.userId+'&tid='+this.state.teacherId
                    +'&date='+this.state.chosenDate,{headers:options})
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
           
            console.log(lessons)
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
           
            console.log(lessons)
            this.setState({extraLessons:lessons})
          }

        
    }

    toggleRegularLessonModal = (e,index) =>{
        this.setState({regularLessonModalIndex:index})
        this.setState({showRegularLessonModal:!this.state.showRegularLessonModal})
        

    }

    toggleExtraLessonModal = (e,index) =>{
        this.setState({extraLessonModalIndex:index})
        this.setState({showExtraLessonModal:!this.state.showExtraLessonModal})
        this.getAllTeacherStudents();

    }
    toggleChangesNotSavedModal  = (e) =>{
        this.setState({showNotSavedModel:!this.state.showNotSavedModel})
    }
  

    getAllTeacherStudents = async ()=>{
       
        var options =  { authorization: this.props.token,
            userid:this.props.userId }

            console.log(options)
          
            await axios.get('/api/lessons/teacher/notday?id='+this.state.teacherId+'&day='+this.state.dayOfWeek+'&date='+this.state.chosenDate,
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
   
  
    
    render(){
        return(
            <div id="EnterDataContainer" style={{marginLeft:'15px',marginRight:'15px'}} >              
            
            
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

                

               

            <div className="row mb-3 mt-3">
                <div className="col" style={{minWidth:'200px'}}>

                    <div  >                
                        
                        <div id="TooltipExample" className="mb-2">
                            <DatePicker placeholderText="pick a date.." className="form-control"
                            dateFormat="dd/MM/yyyy"
                          
                            selected={this.state.chosenDate}
                            onChange={date => this.setDate(date)}
                            />  

                        </div> 
                        <div>
            
                        <Tooltip color="red" placement="right" isOpen={this.state.tooltipOpen} target="TooltipExample" toggle={this.toggle}>
                            Make sure you've saved your changes before changing the date
                        </Tooltip>
                    </div>

                    </div>

                </div>

                <div className="col">

     
                    <div className='mb-1' >
                        <button className="btn btn-outline-primary" style={{width:'200px'}} onClick={this.toggleJustExtra}>
                            {this.state.justExtraBtnMsg}
                        </button>
                    </div>                    

                    <div className='mb-1'>
                        <button className="btn btn-outline-primary" style={{width:'200px'}} onClick={this.toggleExtraLessonModal}>
                                Add Another Lesson
                        </button>
                    </div>

                    <div className='mb-3'  >
                        <button className="btn btn-outline-success" style={{width:'200px'}}  onClick={this.save}>
                                {'Save & Update'}
                        </button>
                    </div  >
                </div>

           
                                     
                 
                </div>

                

                <table id="EnterDataTable" className=" table table-hover table-responsive">
                    <thead>
                        <tr>
                            <th className="w-50" >
                                Name
                            </th>
                            <th style={{width: "15%"}}  >
                                Subject
                            </th>


                            <th style={{width: "15%"}} >

                                Type
                            </th>
                            <th style={{width: "10%"}} >
                                Correction
                            </th>
                            <th style={{width: "10%"}}  >
                                Hours
                            </th>
                            {/* <th style={{width: "10%"}}  >

                            </th> */}
                        </tr>
                    </thead>
                    <tbody>

                        {!this.state.justExtra?

                            this.state.data != null?
                                this.state.data.filter(lesson=>lesson.delete != true).map((item,index)=>(
                                    <tr key={index} style={item.alreadyEntered == true? {background:'rgba(0, 123, 255, 0.5)'} :null}>
                                        <td>
                                            {item.student?.firstName}
                                        </td>
                                        <td>
                                            {item.subject}
                                        </td>
                                        <td>
                                        <div className="form-group">                                        
                                            <select defaultValue={item.alreadyEntered? item.lessonType :item.rateKey.charAt(1) == "G"? 0:1} className="form-control" onChange={(e)=>this.updateLessonType(e,index,false)}>
                                                                                
                                            <option value={0} >group</option>
                                            <option value={1} >1 to 1</option>
                                            </select>                                                 
                                        
                                        </div>

                                        </td>
                                        <td id="correction">
                                        <div className="form-group">
                                        
                                            <select defaultValue={item.correction} className="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.updateCorrection(e,index,false)}>
                                                                            
                                                                    {Corrections?
                                                                     
                                                                    
                                                                        Corrections.map((item,index)=>(
                                                                            <option key={index} value={index} >{item}</option>
                                                                        ))
                                                                    :
                                                                    <option>error</option>
                                                                    }
                                            </select>
                    
                                        
                                        </div>
                                        
                                        </td>
                                        <td id="hours">

                                            <input type="number" min="0" maxLength="3" className="form-control"  defaultValue={item.hours?item.hours:parseFloat(0)} style={item.prevHours != item.hours? {background:'lightgreen'} :null} onChange={(e)=>{this.updateHours(e,index)}}/>
                                        </td>
                                        {/* <td>
                                            <button className="btn btn-danger" onClick={(e)=>this.toggleRegularLessonModal(e,index)}>
                                                X
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            :this.state.chosenDate?
                            <tr>
                                <div style={{position:'absolute',width:'100%'}}>
                                    <Loader color={'#007bff'} loading={true} css={override} size={70} />   
                                </div>
                            </tr>
                              
                                
                            :null                
                       
                                       
                        :null}
                        {
                            !this.state.justExtra?
                                this.state.extraEnteredLessons != null?
                                    this.state.extraEnteredLessons.length >0?
                                        <div className="headers w-100 mb-3 mt-3" >Extra Entered Lessons</div>
                                    :null
                                :null
                            :null
                        }
    
 
        {!this.state.justExtra?

        this.state.extraEnteredLessons != null?
        
            this.state.extraEnteredLessons.filter(lesson=>lesson.delete != true).map((item,index)=>(
                <tr key={index} style={{'background':'rgba(0, 123, 255, 0.5)'}}>
                    <td>
                        {item.student?.firstName}
                    </td>
                    <td>
                        {item.subject}
                    </td>
                    <td>

                        {item.rateKey?.charAt(1) == "G"? "group" : "1 to 1"}

                    </td>
                    <td id="correction">
                    <div className="form-group">
                                            
                        <select defaultValue={item.correction} className="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.updateCorrection(e,index,false,true)}>
                                                        <option></option>
                                                {Corrections?
                                                
                                                
                                                    Corrections.map((item,index)=>(
                                                        <option key={index} value={index} >{item}</option>
                                                    ))
                                                :
                                                <option>error</option>
                                                }
                        </select>

                    
                    </div>
                
                    </td>
                    <td id="hours">
                        <input type="number" className="form-control"  defaultValue={item.hours?item.hours:parseFloat(0)} style={item.prevHours != item.hours? {background:'lightgreen'} :null} onChange={(e)=>{this.updateHours(e,index,false,true)}}/>
                    </td>
                    {/* <td>
                        <button className="btn btn-danger" onClick={(e)=>this.toggleRegularLessonModal(e,index)}>
                            X
                        </button>
                    </td> */}
                </tr>
            ))
        :null                   

                
:null}



                        {
                            this.state.extraLessons?
                                this.state.extraLessons != null?
                                    this.state.extraLessons.length >0?
                                        <div className="headers w-100 mb-3 mt-3" >Extra  Lessons</div>
                                    :null
                                :null
                            :null
                        }                               

                        {this.state.extraLessons?
                            this.state.extraLessons.length > 0?
                                this.state.extraLessons.map((item,index)=>(
                                    <tr key={index}>
                                        <td>
                                        {item.student?.firstName}
                        
                                        </td>
                                        <td>
                                        {item.subject}

                                        </td>
                                        <td>

                        {item.rateKey?.charAt(1) == "G"? "group" : "one to one"}
                    </td>

                                        <td>
                                        <div className="form-group">
                                            
                                            <select defaultValue={item.correction} className="form-control" id="exampleFormControlSelect1" onChange={(e)=>this.updateCorrection(e,index,true)}>
                                                                            <option></option>
                                                                    {Corrections?
                                                                    
                                                                    
                                                                        Corrections.map((item,index)=>(
                                                                            <option key={index} value={index} >{item}</option>
                                                                        ))
                                                                    :
                                                                    <option>error</option>
                                                                    }
                                            </select>
                    
                                        
                                        </div>

                                        </td>
                                        <td>
                                            <input type="number" className="form-control"  defaultValue={item.hours?item.hours:parseFloat(0)} onChange={(e)=>{this.updateHours(e,index,true)}}/>
                                        </td>
                                        {/* <td>
                                            <button className="btn btn-danger" onClick={(e)=>this.removeExtraLesson(e,index)}>
                                                X
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            :null
                        :null}

                  
                    </tbody>
                    </table>


  


               
                   
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
                       
                        <label for="inputEmail4">Student</label>
                        <input value={this.state.extraLesson?this.state.extraLesson.student?.firstName +" ":null} className="form-control" onChange={this.setStudentSearch} placeholder="search for students ..."/>
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
                            <Button color="primary" onClick={(e)=>this.addExtraLesson(this.state.extraLesson)}>Add Extra Lesson</Button>{' '}
                            <Button color="secondary" onClick={this.toggleExtraLessonModal}>Cancel</Button>
                        </ModalFooter>
      
                    </Modal>               

            </div>
        )
    }
}

export default (EnterData);