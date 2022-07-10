const express=require('express')
const router=express.Router()
const custommiddleware=require('../custommiddlewares/custommiddlewares.js')

const usercontroller=require('../controllers/usercontroller.js')



router.post('/createuser',usercontroller.createUser)

router.patch('/addgamestouser/:userid',custommiddleware.Getsingleuser,usercontroller.addgamesToUser)

router.get('/getsingleuserwithgames/:userid',usercontroller.getSingleUserwithGames)

router.get('/getsingleuser/:userid',custommiddleware.Getsingleuser,usercontroller.getSingleUser)

router.get('/getallusers',usercontroller.getAllusers)

router.delete('/deleteuser/:userid',custommiddleware.Getsingleuser,usercontroller.deleteUser)

router.post('/uploadprofilepicture/:userid',usercontroller.multerupload,custommiddleware.Getsingleuser,usercontroller.uploadProfilePicture)


module.exports=router