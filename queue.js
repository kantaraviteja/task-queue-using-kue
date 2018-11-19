const kue = require('kue')

let queue = kue.createQueue();

let ids = [22,23,24,2,25];

function getSquareAfterDelay(id, done) {
    setTimeout(function(){
        done(null,id*id);
    }, 1000);
}

queue.process("getDataofId", function(job, done){
    getSquareAfterDelay(job.data.id, done);
});

queue.on("job complete", function(id, result){
    kue.Job.get(id, function(err, job) {
        if(err) {
            return;
        }
        else {
            console.log("job "+id+" is complete with result "+result);
            job.remove(function(err){
                if(err) {
                    console.error(err);
                }
            });
        }
        
    });
});
kue.Job.rangeByState( 'complete', 0, 100, 'asc', function( err, jobs ) {
    jobs.forEach( function( job ) {
      job.remove( function(){
        console.log( 'removed ', job.id );
      });
    });
  });
  
ids.forEach(function(id){
    let job = queue.create('getDataofId',{
        title:'do something',
        id: id
    }).save(function(err){
        if(!err)
            console.log("job "+id+" in queue");
    });
});


kue.app.listen(3100);