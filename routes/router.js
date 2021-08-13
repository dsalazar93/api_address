const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('../lib/db.js')

const userMiddleware = require('../middlewares/users.js')

router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE username = LOWER(${db.escape(req.body.username)})`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({msg: 'El nombre de usuario ingresado ya esta en uso, intenta con otro'})
      } else {
        // username is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({msg: err})
          } else {
            // has hashed pw => add to database
            db.query(`INSERT INTO users (username, password, registered) VALUES (${db.escape(req.body.username)}, ${db.escape(hash)}, now())`,
              (err, result) => {
                if (err) {
                  throw err
                  return res.status(400).send({msg: err})
                }

                return res.status(201).send({msg: 'Usuario registrado con éxito'})
              }
            )
          }
        })
      }
    }
  )
})

router.post('/login', (req, res, next) => {
  db.query(`SELECT * FROM users WHERE username = ${db.escape(req.body.username)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err
        return res.status(400).send({msg: err})
      }
      if (!result.length) {
        return res.status(401).send({msg: 'El usuario no existe'})
      }
      // check password
      bcrypt.compare(req.body.password, result[0]['password'],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr
            return res.status(401).send({msg: 'Nombre de usuario con contraseña incorrectos'})
          }
          if (bResult) {
            const token = jwt.sign({username: result[0].username, userId: result[0].id}, process.env.SECRET_KET, {expiresIn: '7d'}) 
            db.query(`UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`)
            return res.status(200).send({msg: 'Usuario autenticado con éxito', token})
          }
          return res.status(401).send({msg: 'Nombre de usuario o contraseña incorrectos'})
        }
      )
    }
  )
})

router.get('/get_coordinates', userMiddleware.isLoggedIn, (req, res, next) => {
  // console.log(req.userData)
  res.send('This is the secret content. Only logged in users can see that!')
});

module.exports = router