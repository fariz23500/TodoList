//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// mongodb+srv://admin-fariz:test123@cluster0.wynsl.mongodb.net
mongoose.connect("mongodb+srv://admin-fariz:test123@cluster0.wynsl.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true});
const itemSchema=new mongoose.Schema({
  name:String
});
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List=mongoose.model("list",listSchema);

const Item=mongoose.model("item",itemSchema);
const item1=new Item({
  name:"Welcome to your todoLIst"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});
const item3=new Item({
  name:"<-- hit this to delete an item"
});
const defaultItems=[item1,item2,item3];




app.get("/", function(req, res) {
Item.find({},function(err,foundItems){
if(foundItems.length=== 0){
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);

    }
    else{
      console.log("Success");
    }
  });
  res.redirect("/");
}
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

});





});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("succesfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    }
  );
  }
});

app.get("/:topic", function(req,res){
  const listName=_.capitalize(req.params.topic);
List.findOne({name:listName},function(err,foundlist){
  if(err){
    console.log(err);
  }
  else{
    if(!foundlist)
    {
    // new listTitle
    const list=new List({
      name:listName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+listName)
    }
    else{
      // list exits
      res.render("list",{listTitle:foundlist.name, newListItems:foundlist.items});

    }
  }
})





});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
