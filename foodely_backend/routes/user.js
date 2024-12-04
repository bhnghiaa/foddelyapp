const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../middleware/verifyToken')

router.get('/', verifyTokenAndAuthorization, userController.getUser)
router.get('/get-driver/:driverId', userController.getDriver)
router.get('/verify_phone/:phone', verifyTokenAndAuthorization, userController.verifyPhone)
router.get('/admin-get-all-users', verifyTokenAndAdmin, userController.getUserByAdmin)

router.delete('/', verifyTokenAndAuthorization, userController.deleteUser)

router.post('/verify/:otp', verifyTokenAndAuthorization, userController.verifyAccount)

router.patch('/', verifyTokenAndAuthorization, userController.updateUser)
router.patch('/admin-update-user/:userId', userController.setVerifyAccountByAdmin)

module.exports = router





