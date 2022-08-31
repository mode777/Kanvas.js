function doTask(){
    return new Promise<void>((res,rej) => {
        res()
    })
}

async function main() {
    doTask().then(() => console.log("works"))
    console.log("start")
    await doTask();
    console.log("a")
    await doTask();
    console.log("b")
    await doTask();
    console.log("c")
}

main();