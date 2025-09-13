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


--- 
NEW updates:
  - You understood that the LLM, doesn't really know about the images part, just if you actually fetch the binaries and send them to another AI. 
  - The flow will be like this: You can now to fullfill the images part, via another agent tool call, that can output specific information via a output parser.
  - The second AI, will batch the requests, per property and it will get the data in binary versions, to actually understand the images.
  - START small, this is the first priority, anything else doesn't matter at this stage.


  SESSIONS ID: `
  
  178ad8e4e30947de8b44cf0e625f8e93 - PARIS - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2047
  4dec9c1d5ee24845b6f34cb03ebb7613 - ROMA - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2066
  33c28696-57ec-4a85-9668-ef5d0e303b7d - Charles de Gaulle Airport - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2082
  630908d96a6247de9a6da8826c85a005 - POSITANO - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2064
  6908afb355104020ba6cc5d261f89b76 - BARCELONA - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2092
  53878c1a-27d1-4c9a-a04d-fcfce4ddcad6 - MUNICH - https://primary-production-11988.up.railway.app/workflow/y9jenh0MXes2vec3/executions/2121
---

25 de proprietati, totusi e prea mult, incerc acum cu 15, sa vad sa testez calumea. 

---
- ac9c6dc7e01149d9ad975992745c7408
