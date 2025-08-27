- GEMINI PRO 2.5 nu a mers deloc. Se blocheaza la primul text, din ceva motiv extern, deci 2.5 flash ramane modelul.
- Limita de 50 e prea mare, pt ca ajungem peste tot contextul de 1 milion, maxim 20 de proprietati recomand eu.
- API-ul din ceva motiv e limitat si el, incercand fix pt acel scrapper si face drop la informatii. (am gasit rezolvarea, din query params, sa ii specific eu limita: 2$ de ex)


- Booking-ul tine cont de limit, dar airbnb nu, el tine cont de maxTotalChargeUsd.

- Id execution: b5db55e25dd7449898f4bd7d6db957e4, 9f3e4724ce604e47bdbc75f06eecf588
- Am inceput si un flow extern pt a analiza imagini, dar inca nu e terminat.
- Am inceput sa adaug si validare per inputs, sa ma asigur ca trimite totul bine, la APIFY scrapers.

- Finish AI IMAGEs selection, via the new workflow.