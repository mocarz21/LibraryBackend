const { Books } = require('../models')
const SqlGo = require('../utils/SqlGo')

exports.showAll = async (req, res) => {
  try {
    const { query } = req;

    const results = await SqlGo(Books)
      .like("type", query.type)
      .getSeries();

    res.json({
      status: "success",
      data: results,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: `Nie udało się pobrać słowników. ErrorMessage: ${error}`,
    });
  }
};