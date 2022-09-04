function throwError(){
    return new Promise(function(res,rej){
        res()
        //rej(new Error("This is an error"))
    })

}

throwError()