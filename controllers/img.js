const path = require('path');
const fs = require('fs');

exports.save = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'Nie przesłano pliku.' });
    }

    const uploadedFile = req.files.file;

    const nazwaFolderu = 'OkładkaImg';
    const sciezkaDoFolderu = path.join(__dirname, `../${nazwaFolderu}`);
    // Tutaj dodaj kod, który zapisuje przesłany obraz na serwerze
    // Możesz użyć metod takich jak `mv` w zależności od tego, jak jest zdefiniowana
    // biblioteka do obsługi przesyłania plików, na przykład `express-fileupload`.

    // Przykładowe zapisanie pliku
    uploadedFile.mv(path.join(sciezkaDoFolderu, req.params.name + '.jpg'), (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).json({ message: 'Plik został zapisany.' });
    });
  } catch (error) {
    console.error('Wystąpił błąd:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas zapisu pliku.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const nazwaFolderu = 'OkładkaImg';
    const filename = req.params.filename;
    const filePath = path.join(__dirname, `../${nazwaFolderu}`, filename);

    // Prześlij plik na frontend
    res.sendFile(filePath);
  } catch (error) {
    console.error('Wystąpił błąd:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania obrazu.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const nazwaFolderu = 'OkładkaImg';
    const sciezkaDoFolderu = path.join(__dirname, `../${nazwaFolderu}`);

    // Pobierz listę plików w folderze "OkładkaImg"
    fs.readdir(sciezkaDoFolderu, (err, files) => {
      if (err) {
        console.error('Błąd podczas pobierania listy plików:', err);
        return res.status(500).json({ message: 'Wystąpił błąd podczas pobierania listy plików.' });
      }

      // Utwórz tablicę z informacjami o wszystkich plikach
      const images = files.map((file) => ({
        name: file,
        url: `http://localhost:8080/download/img/${file}`, // Ścieżka do pobierania pojedynczego obrazu
      }));

      res.status(200).json(images);
    });
  } catch (error) {
    console.error('Wystąpił błąd:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas pobierania obrazów.' });
  }
};
