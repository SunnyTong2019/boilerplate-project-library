/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
    if(err) console.log('Database error: ' + err);

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
       db.collection("books").find({}).toArray(function(err, result) {
         if (err) console.log(err);
         var array=[];
         
         for (var i=0; i<result.length; i++)
         {
             var commentCount;
            
             if (!result[i].comments)
             { commentCount=0; }
             else { commentCount=result[i].comments.length; }
            
             var object={"_id": result[i]._id, "title": result[i].title, "commentcount": commentCount};
             array.push(object);
          }
          res.json(array);
       });
     })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title)
      { 
        db.collection("books").insertOne(
          { title: title },
          (err, doc) => { 
            if (err) console.log(err);
            res.json(doc.ops);
        });
       }
       else { res.json('no title sent'); }
     })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection("books").deleteMany({},
        (err, doc) => { 
          if (err) console.log(err);
          res.json('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection("books").findOne({_id: new ObjectId(bookid)}, function(err, result) {
         if (err) console.log(err);
         
         if (result)
         {
           var comments;
            
           if (!result.comments)
           { comments=[]; }
           else { comments=result.comments; }
          
           res.json({"_id": result._id, "title": result.title, "comments": comments});
         }
         else
         { res.json('no book exists'); }
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      //here use db.collection.findOneAndUpdate, not use db.collection.updateOne, because updateOne doesn't return updated document.
      if (!comment)
      { res.json('no comment sent'); }
      else
      {
         db.collection("books").findOneAndUpdate(
            {_id: new ObjectId(bookid)}, 
            {$push: {comments: comment}}, 
            {returnOriginal: false}, 
            function(err, r) {
              if (err) console.log(err);
              if(r.value)
              { res.json(r.value); }
              else
              { res.json('no book exists'); }
          });
       }
     })

    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.collection("books").deleteOne({_id: new ObjectId(bookid)},
        (err, doc) => { 
          if (err) console.log(err);
          res.json('deleted successful');
      });
    });
  });
};
