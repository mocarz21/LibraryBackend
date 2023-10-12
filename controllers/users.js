const { Users, Employees } = require('../models')
const SqlGo = require('../utils/SqlGo')
const bcrypt = require("bcrypt");
const { findOneByData, findById, save, removeById } = require("../helpers");
const  jwt = require("jsonwebtoken");
const dotenv =  require("dotenv");
const { pick } = require("lodash");

exports.showOne = async (req, res) =>{
  
  try{
    const { id } = req.params

    if(id) {
      const user = await findById({
        id: id,
        model: Users,
      });
      console.log('userrrrrrr',user)
      res.json({
        status: "success",
        body: {
          id: user.id,
          firstName: user.imie,
          lastName: user.nazwisko,
          email: user.email,
          bookId: user.id_ksiazki,
          pesel: user.pesel,
          avatar: user.avatar,
          city: user.miasto,
          streetName: user.ulica,
          homeNr: user.nr_domu,
          birthday: user.data_urodzenia,
          cardNumber: user.nr_karty_bibliotecznej,
          source: user.source,
        }
      })
    }  
  }catch(error) {
    res.json({
      status: "error",
      message: "Wystąpił błąd " + error
    })
  }

};


exports.showAll = async (req, res) => {
  dotenv.config()
  try {
    const { query } = req;

    const [usersResults, employeesResults] = await Promise.all([
      SqlGo(Users).like("type", query.type).getSeries(),
      SqlGo(Employees).like("type", query.type).getSeries()
    ])

    // Dodanie dodatkowego pola do wyników
    const mUsersResults = usersResults.map(result => ({ ...result, source: 'Users' }));
    const mEmployeesResults = employeesResults.map(result => ({ ...result, source: 'Employees' }));
    
    const allResults = [...mUsersResults, ...mEmployeesResults];
    res.json({
      status: "success",
      data: allResults,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: `Nie udało się pobrać uzytkownikow. ErrorMessage: ${error}`,
    });
  }
};

exports.authenticate = async (req, res) => {
  console.log('req.body:', req.body);
  try {
    const { login, password } = req.body; 

    // Sprawdzamy, czy istnieje użytkownik o podanym loginie
    let user = await findOneByData({
      data: { login },
      model: Users,
    });
    console.log('User1:', user);

    if (!user) {
      user = await findOneByData({
        data: { login }, 
        model: Employees,
      });
      console.log('User2:', user);
    }

    if (!user) {
      return res.status(401).json({ message: "Nieprawidłowy login" });
    }

    // Sprawdzamy, czy hasło jest poprawne
    //const passwordMatch = await bcrypt.compare(password, user.password);
    if (password === user.password) {

      //Generujemy token JWT dla zalogowanego użytkownika

      const accessToken = jwt.sign(
        { userId: user.id},
        process.env.TOKEN_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const refreshToken = jwt.sign(
        { userId: user.id},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: 525600 }
      );

      // Zwracamy token jako odpowiedź API
      return res.status(200).json({
        status: "success",
        body: {
          id: user.id,
          firstName: user.imie,
          lastName: user.nazwisko,
          email: user.email,
          bookId: user.id_ksiazki,
          pesel: user.pesel,
          avatar: user.avatar,
          city: user.miasto,
          streetName: user.ulica,
          homeNr: user.nr_domu,
          birthday: user.data_urodzenia,
          cardNumber: user.nr_karty_bibliotecznej,
          source: user.source,
          accessToken: "Bearer " + accessToken,
          refreshToken: "Bearer " + refreshToken,
        },
      });
    } else {
      return res.status(401).json({ message: "Nieprawidłowy hasło" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Wystąpił błąd serwera" });
  }
};

exports.isLogged = async (req, res) => {
  try {

    const { token } = req.params;
    let id;

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
      if(err) {
        console.log("Weryfikacja tokenu nieudana " + err)
      } else {
        id = decodedToken.userId;
      }
    });

    if(id) {
      const user = await findById({
        id,
        model: Users,
      });
      res.json({
        status: "success",
        body: {
          id: user.id,
          firstName: user.imie,
          lastName: user.nazwisko,
          email: user.email,
          bookId: user.id_ksiazki,
          pesel: user.pesel,
          avatar: user.avatar,
          city: user.miasto,
          streetName: user.ulica,
          homeNr: user.nr_domu,
          birthday: user.data_urodzenia,
          cardNumber: user.nr_karty_bibliotecznej,
          source: user.source,
        }
      })
    } else {
      res.json({
        status: "error",
        message: "Użytkownik nie istnieje"
      })
    }

  } catch(error) {
    res.json({
      status: "error",
      message: "Wystąpił błąd " + error
    })
  }
}

exports.save = async (req, res) => {
  try {
    const { userId, body } = req;

    const data = pick(body, [
      "id",
      "imie",
      "nazwisko",
      "email",
      "id_ksiazki",
      "pesel",
      "avatar",
      "miasto",
      "ulica",
      "nr_domu",
      "data_urodzenia",
      "nr_karty_bibliotecznej",
    ]);

    // Ustawienie user_id, jeśli jest to konieczne
    const processedData = {
      ...data
    };

    await save({
      model: Users,
      data: processedData
    });

    res.json({
      status: "success",
      message: "Dane użytkownika zostały zapisane."
    });

  } catch(error) {
    console.error("Błąd podczas zapisywania użytkownika:", error);
    res.json({
      status: "error",
      message: "Wystąpił błąd: " + error.message
    });
  }
};

exports.remove = async (req, res) => {
  const id = req.params.id;
  removeById({ id: id, model: Users });
};