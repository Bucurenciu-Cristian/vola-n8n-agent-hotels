- GEMINI PRO 2.5 nu a mers deloc. Se blocheaza la primul text, din ceva motiv extern, deci 2.5 flash ramane modelul.
- Limita de 50 e prea mare, pt ca ajungem peste tot contextul de 1 milion, maxim 20 de proprietati recomand eu.
- API-ul din ceva motiv e limitat si el, incercand fix pt acel scrapper si face drop la informatii. (am gasit rezolvarea, din query params, sa ii specific eu limita: 2$ de ex)


- Booking-ul tine cont de limit, dar airbnb nu, el tine cont de maxTotalChargeUsd.

- Id execution: b5db55e25dd7449898f4bd7d6db957e4, 9f3e4724ce604e47bdbc75f06eecf588
- Am inceput si un flow extern pt a analiza imagini, dar inca nu e terminat.
- Am inceput sa adaug si validare per inputs, sa ma asigur ca trimite totul bine, la APIFY scrapers.

# Finish AI IMAGEs selection, via the new workflow.

## Work already done.


- 
- in apify_short folder you have all the data you need (all the last 3 data scrappers limited to 10) to actually create this new workflow. Test it properly first, and then, you'll connect it in the right approach via a webhook.


## TODO {now}

- You have to easily create a great structure for the new workflow, and to actually test if the new AI agent is really accessing the urls or not, to actually see the images.
- One way of this is to call that tool(the new workflow), for every property in order, not parallel, to really know that the AI agent has accessed it.
- Baby steps, start small with just one property, let it choose the best images and then continue on. It's kinda simple.
