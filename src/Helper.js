

function getDateData(date)
{
   
    var year = date.getFullYear().toString()
    var month = date.getMonth().toString()
    var day = date.getDate().toString()

    var obj = {day: day, month: month, year: year}


    return obj;

}

export { getDateData };