const { Rentals } = require('../models')
const SqlGo = require('../utils/SqlGo')
const { pick } = require('lodash')
const { findById, save, removeById } = require("../helpers");

exports.showOne = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const response = await findById({
      id: rentalId,
      model: Rentals,
    });
    res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    res.json({
      status: "error",
      data: {},
      message: `Nie udało się pobrać wypozyczenia. ErrorMessage: ${error}`,
    });
  }
};

exports.showAll = async (req, res) => {
  try {
    const { query } = req;

    const results = await SqlGo(Rentals)
      .like("type", query.type)
      .getSeries();

    res.json({
      status: "success",
      data: results,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: `Nie udało się pobrać wypozyczeń. ErrorMessage: ${error}`,
    });
  }
};

exports.save = async (req, res) =>{
  try{
   const { body } = req // zostawiam możliwie do przerobienia podajac dodatkowo id
    console.log(body)
    const data = pick(body,[
      "id",
      "id_books",
      "id_user",
      "rental_date",
      "return_date",
      "approved",
    ])

    const processedData = { // zostawiam możliwie do przerobienia podajac dodatkowo id 
      ...data
    };
    await save({
      model: Rentals,
      data: processedData
    })
    res.json({
      status: "success",
      message: "Wypożyczenie dodano"
    })

  }catch(error){
    console.error('błąd podczas zapisywania wypozyczenia ', error)
    res.json({
      status: error,
      message: "Błąd" + error.message
    })
  }
}

exports.remove = async (req, res) => {
  const id = req.params.id;
  removeById({ id: id, model: Rentals });
};