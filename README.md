# Projekt 04
# rozwinięcie poprzedniego projektu 03, lekkie zmiany UI aby poprawić czytelność. System użytkowników opierający się na bazie danych i cookiesach, administratorzy mogą edytować wszystkie dane, użytkownicy bez uprawnień mogą edytować jedynie dane dodane przez siebie. Bez zalogowania można jedynie oglądać dane. 
jest możliwy przyszły rozwój w postaci dodania nowej bazy danych z np. danymi technicznymi czołgów (też możliwe do edycji przez użytkownika) w relacji z listą poprzez foreign key


>npm install express
>npm install cookie-parser
>npm install argon2

przed uruchomieniem: 
>npm run gen_env

normalne uruchomienie:
>npm run index.js

załadowanie danych przykładowych/testowych:
>populate=1 npm run index.js
