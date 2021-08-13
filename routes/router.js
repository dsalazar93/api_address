const express = require('express')
const router = express.Router()

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('../lib/db.js')

const userMiddleware = require('../middlewares/users.js')

const services = require('../services/geoCoding.js')

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

router.get('/get_coordinates/', userMiddleware.isLoggedIn, (req, res, next) => {
  const address = req.body.address.trim().length > 0 ? encodeURIComponent(req.body.address) : null
  if(address){
    // Servicio Geocoding de Google
    services.google(address).then((response) => {
      if(response.data.status == "OK"){
        let ubications = response.data.results.map((result) => {
          let location = {
            address: result.formatted_address,
            coordinates: result.geometry.location
          }
  
          return location
        })
        return res.status(200).send(ubications)
      } else {
        //Servicio Geocoding HERE
        services.here(address).then((response) => {
          if (response.data.items.length > 0){
            let ubications = response.data.items.map((result) => {
              let location = {
                address: result.title,
                coordinates: result.position
              }

              return location
            })

            return res.status(200).send(ubications)
          } else {
            return res.status(401).send({msg: 'No se encontraron resultados'})
          }
        })
      }
    })

  } else {
    return res.status(401).send({msg: 'Ingresa una dirección'})
  }
});

module.exports = router