# Disponibilidad de dominios y conflictos de nombre: lista semilla para reemplazar "BrAInance"

Foto tomada el **2026-10-08, entre las 10:40 y las 11:00 UTC** (07:40–08:00 hora de Argentina). Se revisaron 24 semillas × 25 combinaciones = **600 dominios**: NAME, holaNAME, NAMEapp y miNAME en .com/.com.ar/.ar/.app; getNAME solo en .com; y dos compuestos rioplatenses por semilla en los cuatro TLD. Las tildes se sacaron para la forma ASCII: alo, responde, vigia.

**Advertencia de método (leer antes de usar la tabla):** el proxy de salida de este entorno bloqueó **todos** los métodos pedidos: RDAP de Verisign, NIC.ar y Google Registry, el whois de NIC.ar, `dig` (no está instalado), Afternic/Sedo/Dan, INPI, WIPO Global Brand Database y USPTO. También bloqueó WebFetch hacia cualquier sitio. Lo único que funcionó fue la **resolución DNS recursiva** (UDP a 8.8.8.8 y 8.8.4.4, los resolvers del sistema) y el **buscador web**. Por eso, "registrado / no registrado" sale de la **delegación DNS** y no del registro: es un equivalente a `dig NS`, no a RDAP. Los comandos y las salidas crudas están en el Apéndice A, dentro de la sección 1.

## 1. ¿Qué .com / .com.ar / .ar / .app están libres?

### Takeaway
Las 24 semillas tienen el **.com pelado registrado**. En los otros TLD hay huecos: **10 .com.ar** y **14 .ar** no aparecen en DNS, en .app solo **5** (atento, encargado, cadete, presente, avisa), y quedan **10 getNAME.com**, **20 holaNAME.com** y **11 NAMEapp.com** sin delegar. En .com, .app y .com.ar delegados, "no aparece en DNS" es un indicio fuerte de que el dominio está libre. En **.ar y .com.ar es un indicio débil**: falta confirmarlo en nic.ar antes de comprar, porque NIC.ar estaba bloqueado.

### Cited Findings
- **Métodos bloqueados por el proxy de egreso (403 al CONNECT):** rdap.verisign.com, rdap.nic.ar, www.registry.google, pubapi.registry.google, dns.google (DoH), cloudflare-dns.com, rdap.org, nic.ar, branddb.wipo.int, www.wipo.int, tsdr.uspto.gov, tmsearch.uspto.gov, portaltramites.inpi.gob.ar y api.domainsdb.info. WebFetch respondió `EGRESS_BLOCKED` para todos esos y además para whois.com, who.is, lookup.icann.org, godaddy.com, porkbun.com, nic.ar, wikipedia, capterra y los propios sitios, como tilde.com. — (pruebas propias, salidas crudas en el Apéndice A)
- **Lo que sí funcionó:** consultas DNS recursivas por UDP a 8.8.8.8 y 8.8.4.4. Las consultas directas sin recursión a los servidores de cada TLD (a.gtld-servers.net, c.dns.ar, ns-tld1.charlestonroadregistry.com) devolvieron SERVFAIL siempre, incluso para dominios conocidos, así que hay intercepción y no se usaron. — (pruebas propias, Apéndice A)
- **Totales del barrido** (10:43:27–10:44:08 UTC): 403 dominios con NXDOMAIN en ambos resolvers, 188 delegados con NS y 9 con SERVFAIL o timeout que se tratan como registrados (la zona del TLD los delega pero sus NS no responden; responde.com dio timeout y en el reintento SERVFAIL). — (barrido propio, Apéndice A)
- **NAME pelado:**
  - **.com** registrado en las 24 semillas.
  - **.com.ar sin delegar:** recado, mostrador, deturno, cadete, presente, avisa, atendido, abierto, contesta y responde.
  - **.ar sin delegar:** recado, sereno, atento, encargado, cadete, portero, campana, avisa, atendido, abierto, vigia, contesta, responde y mostra.
  - **.app sin delegar:** atento, encargado, cadete, presente y avisa.
  - (barrido propio, Apéndice A)
- **Variantes .com sin delegar:**
  - **getNAME.com:** recado, mostrador, atento, deturno, encargado, cadete, portero, presente, atendido y abierto.
  - **NAMEapp.com:** mostrador, deturno, encargado, cadete, campana, avisa, atendido, abierto, contesta, siempre y mostra.
  - **miNAME.com:** tilde, deturno, cadete, presente, campana, atendido, abierto, responde, siempre y mostra.
  - **holaNAME:** libre en los 4 TLD para 19 semillas; las excepciones son timbre, presente, faro, turno y siempre (holasiempre.app está tomado).
  - (barrido propio, Apéndice A)
- **Regla actual de .ar:** la preferencia para titulares de .com.ar fue una ventana de 2019. Hubo prerregistro preferencial del 11/09/2019 al 09/11/2019 para dominios registrados antes del 01/12/2015 y luego una etapa de interés general. Desde el 23/02/2020 cualquier nombre disponible se registra directo bajo .ar con las reglas generales. Tener el .com.ar ya no da prioridad, pero un tercero puede iniciar una disputa alegando mejor derecho. — [Marval](https://www.marval.com/Publicacion/nic-argentina-habilito-el-registro-de-nombres-de-dominio-en-el-cctld-ar-13420?lang=es); [abogados.com.ar](https://abogados.com.ar/index.php/nicar-registros-de-nombres-de-dominio-ar-ahora-disponibles/26825); [NIC.ar, PDF de lanzamiento](https://NIC.ar/sites/default/files/2019-09/Lanzamiento-de-dominios-ar_0.pdf)
- **Precio de referencia (julio de 2026):** .ar cuesta $25.500 ARS y .net.ar $8.500 ARS por registro, renovación anual y transferencia. — [iProfesional](https://www.iprofesional.com/tecnologia/397387-cual-es-el-costo-de-registrar-un-dominio-en-internet-en-argentina)

#### Leyenda de la matriz
- **REG · X**: el dominio está delegado en DNS (tiene NS), o sea registrado. X es lo que se infiere de los nameservers y no del contenido: "en venta: Afternic/Efty/Atom/Aftermarket.com", "parking Sedo/ParkingCrew/Above", "NameFind (portafolio GoDaddy)", "NameBright (patrón HugeDomains)", "vencido/recuperación", o el proveedor (Cloudflare, Vercel, AWS…). "sin A" significa que no tiene registro A, es decir, ningún sitio web en el apex.
- **REG\***: SERVFAIL. La zona del TLD lo delega pero sus NS no contestan. Se toma como registrado.
- **libre?**: NXDOMAIN en 8.8.8.8 y 8.8.4.4, es decir, no figura en la zona. En .com/.app es casi seguro que está libre (salvo dominios en *hold*, *redemption* o reservados/premium). En .com.ar/.ar **puede estar registrado sin delegar**: confirmar en nic.ar.
- **n/a**: no se revisó (getNAME solo en .com).

#### Matriz por semilla (600 dominios)

#### tilde

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| tilde | REG · Azure DNS | REG · NS serverilusionideas.com | REG · AWS Route53 | REG · en venta: Aftermarket.com |
| holatilde | libre? | libre? | libre? | libre? |
| tildeapp | REG · NS register.it | libre? | libre? | libre? |
| mitilde | libre? | libre? | libre? | libre? |
| gettilde | REG · NameBright (patrón HugeDomains) | n/a | n/a | n/a |
| contilde | libre? | libre? | libre? | libre? |
| tutilde | libre? | libre? | libre? | libre? |

#### recado

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| recado | REG · NS giantpanda | libre? | libre? | REG · AWS Route53, sin A |
| holarecado | libre? | libre? | libre? | libre? |
| recadoapp | REG · Cloudflare | libre? | libre? | libre? |
| mirecado | REG · Cloudflare, sin A | libre? | libre? | libre? |
| getrecado | libre? | n/a | n/a | n/a |
| elrecado | REG · vencido/recuperación | REG · NS webhosting-network-services.com | libre? | libre? |
| turecado | REG · NS gestiondecuenta.com | libre? | libre? | libre? |

#### sereno

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| sereno | REG · AWS Route53 | REG · NS nsone.net | libre? | REG · Cloudflare |
| holasereno | libre? | libre? | libre? | libre? |
| serenoapp | REG · Cloudflare | libre? | libre? | libre? |
| misereno | REG · NS directnic.com | libre? | libre? | libre? |
| getsereno | REG · Cloudflare, sin A | n/a | n/a | n/a |
| elsereno | REG · parking Above | REG · NS erconsultor.com | REG · Cloudflare, sin A | REG · NS servidoresdns.net |
| tusereno | REG · Hostinger (parking) | libre? | libre? | libre? |

#### timbre

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| timbre | REG · NS hover.com | REG · Cloudflare | REG · Cloudflare, sin A | REG · NS spaceship.net |
| holatimbre | REG · vencido/recuperación | libre? | libre? | libre? |
| timbreapp | REG · Cloudflare | libre? | libre? | libre? |
| mitimbre | REG · NameBright (patrón HugeDomains) | libre? | libre? | libre? |
| gettimbre | REG · NS domaincontrol.com | n/a | n/a | n/a |
| eltimbre | REG · NS im-global.net | libre? | libre? | libre? |
| tutimbre | libre? | libre? | libre? | libre? |

#### mostrador

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| mostrador | REG · en venta: Afternic | libre? | REG · Vercel | REG · NS name.com |
| holamostrador | libre? | libre? | libre? | libre? |
| mostradorapp | libre? | libre? | libre? | libre? |
| mimostrador | REG · NS neubox.net | REG · NS donweb.com | libre? | REG · NS name.com |
| getmostrador | libre? | n/a | n/a | n/a |
| elmostrador | REG · parking ParkingCrew | libre? | libre? | REG · Vercel |
| tumostrador | REG · GoDaddy (A de parking) | REG · Cloudflare | libre? | libre? |

#### atento

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| atento | REG · Azure DNS | REG · NS com.ar | libre? | libre? |
| holaatento | libre? | libre? | libre? | libre? |
| atentoapp | REG · GoDaddy (A de parking) | libre? | libre? | libre? |
| miatento | REG · NS hostmar.com | libre? | libre? | libre? |
| getatento | libre? | n/a | n/a | n/a |
| siempreatento | REG* (NS no responde) | libre? | libre? | libre? |
| tuatento | libre? | libre? | libre? | libre? |

#### deturno

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| deturno | REG · en venta: Afternic | libre? | REG · Cloudflare | REG · Cloudflare |
| holadeturno | libre? | libre? | libre? | libre? |
| deturnoapp | libre? | libre? | libre? | libre? |
| mideturno | libre? | libre? | libre? | libre? |
| getdeturno | libre? | n/a | n/a | n/a |
| estadeturno | libre? | libre? | libre? | libre? |
| eldeturno | libre? | libre? | libre? | libre? |

#### encargado

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| encargado | REG · parking Above | REG · Cloudflare, sin A | libre? | libre? |
| holaencargado | libre? | libre? | libre? | libre? |
| encargadoapp | libre? | libre? | libre? | libre? |
| miencargado | REG · Cloudflare, sin A | libre? | libre? | libre? |
| getencargado | libre? | n/a | n/a | n/a |
| elencargado | REG · Hostinger (parking) | REG · Vercel | libre? | REG · Vercel |
| tuencargado | REG · NS squarespacedns.com | libre? | libre? | libre? |

#### cadete

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| cadete | REG* (NS no responde) | libre? | libre? | libre? |
| holacadete | libre? | libre? | libre? | libre? |
| cadeteapp | libre? | libre? | libre? | libre? |
| micadete | libre? | libre? | libre? | libre? |
| getcadete | libre? | n/a | n/a | n/a |
| elcadete | REG · en venta: Afternic | libre? | libre? | libre? |
| tucadete | REG* (NS no responde) | libre? | libre? | libre? |

#### portero

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| portero | REG · NS dnsmadeeasy.com | REG · NS mydomain.com, sin A | libre? | REG · GoDaddy (A de parking) |
| holaportero | libre? | libre? | libre? | libre? |
| porteroapp | REG · NS dreamhost.com, sin A | libre? | libre? | libre? |
| miportero | REG · NS donweb.com | libre? | libre? | REG · Vercel |
| getportero | libre? | n/a | n/a | n/a |
| elportero | REG · NameBright (patrón HugeDomains) | libre? | libre? | libre? |
| tuportero | REG · GoDaddy (A de parking) | libre? | libre? | REG · NS ui-dns.de |

#### presente

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| presente | REG · NameFind (portafolio GoDaddy) | libre? | REG · NS nsone.net | libre? |
| holapresente | REG · GoDaddy (A de parking) | libre? | libre? | libre? |
| presenteapp | REG · NS domaincontrol.com | libre? | libre? | libre? |
| mipresente | libre? | libre? | libre? | libre? |
| getpresente | libre? | n/a | n/a | n/a |
| siemprepresente | REG · en venta: Afternic | REG · NS com.ar | libre? | libre? |
| estoypresente | REG · GoDaddy (A de parking) | libre? | libre? | libre? |

#### campana

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| campana | REG · NS constellationhbs.com | REG* (NS no responde) | libre? | REG · Cloudflare, sin A |
| holacampana | libre? | libre? | libre? | libre? |
| campanaapp | libre? | libre? | libre? | libre? |
| micampana | libre? | libre? | libre? | libre? |
| getcampana | REG · Cloudflare | n/a | n/a | n/a |
| lacampana | REG · parking Sedo | REG · Cloudflare | libre? | REG · Vercel |
| tucampana | libre? | libre? | libre? | libre? |

#### avisa

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| avisa | REG · NS giantpanda | libre? | libre? | libre? |
| holaavisa | libre? | libre? | libre? | libre? |
| avisaapp | libre? | libre? | libre? | libre? |
| miavisa | REG · NS neothek.com | libre? | libre? | libre? |
| getavisa | REG · Cloudflare | n/a | n/a | n/a |
| avisame | REG · parking ParkingCrew | libre? | libre? | REG · Cloudflare |
| teavisa | REG · NS domaincontrol.com | REG · AWS Route53 | libre? | libre? |

#### atendido

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| atendido | REG · GoDaddy (A de parking) | libre? | libre? | REG · Cloudflare |
| holaatendido | libre? | libre? | libre? | libre? |
| atendidoapp | libre? | libre? | libre? | libre? |
| miatendido | libre? | libre? | libre? | libre? |
| getatendido | libre? | n/a | n/a | n/a |
| bienatendido | REG · Cloudflare | libre? | libre? | libre? |
| tenesatendido | libre? | libre? | libre? | libre? |

#### abierto

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| abierto | REG · NS dyna-ns.net | libre? | libre? | REG · Cloudflare |
| holaabierto | libre? | libre? | libre? | libre? |
| abiertoapp | libre? | libre? | libre? | libre? |
| miabierto | libre? | libre? | libre? | libre? |
| getabierto | libre? | n/a | n/a | n/a |
| siempreabierto | REG · vencido/recuperación | REG · NS hostmar.com | libre? | REG · NS hostmar.com |
| estamosabiertos | REG · parking Above | libre? | libre? | libre? |

#### vigia

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| vigia | REG · NS dnsmadeeasy.com | REG · NS dnsmadeeasy.com | libre? | REG · NS intercloud.es, sin A |
| holavigia | libre? | libre? | libre? | libre? |
| vigiaapp | REG · Cloudflare | libre? | libre? | libre? |
| mivigia | REG · NS dreamhost.com | REG · Cloudflare, sin A | REG · Cloudflare, sin A | libre? |
| getvigia | REG · NS name.com | n/a | n/a | n/a |
| elvigia | REG · NS ginernet.com | REG · NS com.ar, sin A | libre? | libre? |
| tuvigia | REG · NS googledomains.com | libre? | libre? | REG · Cloudflare |

#### faro

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| faro | REG · NS oraclecloud.net | REG · NS afraid.org | REG · NS supporthost.eu | REG · Cloudflare |
| holafaro | REG · NS registrar-servers.com | libre? | libre? | libre? |
| faroapp | REG · en venta: Atom | libre? | libre? | REG · NS registrar-servers.com |
| mifaro | REG · en venta: Afternic | libre? | libre? | REG · Cloudflare |
| getfaro | REG · GoDaddy (A de parking) | n/a | n/a | n/a |
| elfaro | REG · NS googledomains.com | REG · NS hostmar.com | REG* (NS no responde) | REG · Cloudflare |
| tufaro | REG · NS dreamhost.com | libre? | libre? | libre? |

#### alo

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| alo | REG · Cloudflare | REG · NS 101domain.com | REG · NS 101domain.com | REG · en venta: Afternic |
| holaalo | libre? | libre? | libre? | libre? |
| aloapp | REG · en venta: Atom | libre? | libre? | REG · Cloudflare, sin A |
| mialo | REG · GoDaddy (A de parking) | libre? | libre? | REG · NS registrar-servers.com |
| getalo | REG · NS NamePros | n/a | n/a | n/a |
| aloalo | REG · en venta: Afternic | libre? | libre? | REG* (NS no responde) |
| decialo | libre? | libre? | libre? | libre? |

#### contesta

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| contesta | REG · NS domaincontrol.com | libre? | libre? | REG* (NS no responde) |
| holacontesta | libre? | libre? | libre? | libre? |
| contestaapp | libre? | libre? | libre? | libre? |
| micontesta | REG · NS supremedns.com | libre? | libre? | libre? |
| getcontesta | REG · NS registrar-servers.com | n/a | n/a | n/a |
| contestame | REG · NS servidoresdns.net | libre? | libre? | libre? |
| tecontesta | REG · NS dondominio.com | libre? | libre? | libre? |

#### responde

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| responde | REG* (NS no responde) | libre? | libre? | REG · NS ui-dns.biz |
| holaresponde | libre? | libre? | libre? | libre? |
| respondeapp | REG · Cloudflare | libre? | libre? | libre? |
| miresponde | libre? | libre? | libre? | libre? |
| getresponde | REG · NS dyna-ns.net | n/a | n/a | n/a |
| teresponde | REG · NS bluehost.com | libre? | libre? | libre? |
| respondeme | REG · NS giantpanda | libre? | libre? | libre? |

#### siempre

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| siempre | REG · GoDaddy (A de parking) | REG · Vercel | REG · Cloudflare | REG · NS registrar-servers.com |
| holasiempre | libre? | libre? | libre? | REG · NS porkbun.com |
| siempreapp | libre? | libre? | libre? | libre? |
| misiempre | libre? | libre? | libre? | libre? |
| getsiempre | REG · AWS Route53, sin A | n/a | n/a | n/a |
| siempreahi | REG · Vercel | libre? | libre? | libre? |
| siempreesta | REG · GoDaddy (A de parking) | libre? | libre? | libre? |

#### mostra

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| mostra | REG · en venta: Efty | REG · AWS Route53 | libre? | REG · Cloudflare |
| holamostra | libre? | libre? | libre? | libre? |
| mostraapp | libre? | libre? | libre? | libre? |
| mimostra | libre? | libre? | libre? | libre? |
| getmostra | REG · NS name.com | n/a | n/a | n/a |
| mostrame | REG · NameBright (patrón HugeDomains) | libre? | libre? | libre? |
| mostrala | libre? | libre? | libre? | libre? |

#### turno

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| turno | REG · Cloudflare | REG · Cloudflare | REG · Cloudflare | REG · NS name.com, sin A |
| holaturno | REG · NS registrar-servers.com | libre? | libre? | REG · Hostinger (parking) |
| turnoapp | REG · Cloudflare | REG · NS donweb.com | libre? | REG · Cloudflare, sin A |
| miturno | REG · parking Sedo | libre? | libre? | REG · Cloudflare |
| getturno | REG · Cloudflare, sin A | n/a | n/a | n/a |
| tuturno | REG · NameBright (patrón HugeDomains) | REG* (NS no responde) | REG · Cloudflare, sin A | REG · NS domaincontrol.com |
| sinesperas | REG · en venta: Afternic | REG · NS registrar-servers.com | libre? | libre? |

#### guardia

| Variante | .com | .com.ar | .ar | .app |
|---|---|---|---|---|
| guardia | REG · en venta: Afternic | REG · Hostinger (parking) | REG · Hostinger (parking) | REG · NS com.br |
| holaguardia | libre? | libre? | libre? | libre? |
| guardiaapp | REG · GoDaddy (A de parking) | libre? | libre? | REG · GoDaddy (A de parking) |
| miguardia | REG · en venta: Afternic | libre? | libre? | REG · Cloudflare |
| getguardia | REG · NS dnsowl.com | n/a | n/a | n/a |
| deguardia | REG · NS power-dns.com | REG · NS wordpress.com | REG · Cloudflare | REG · NS registrar-servers.com |
| laguardia | REG · NS dreamhost.com | REG · AWS Route53 | libre? | REG · NS porkbun.com, sin A |

#### Apéndice A: comandos exactos y salidas crudas

**A.1 Intentos con RDAP, DoH y web (bloqueados), 10:40 UTC**

```text
$ curl -sS -o $S/t.out -w "%{http_code}" -H 'accept: application/dns-json, application/rdap+json' --max-time 20 "<URL>"
curl: (56) CONNECT tunnel failed, response 403
000 https://rdap.verisign.com/com/v1/domain/brainance.com
000 https://rdap.verisign.com/com/v1/domain/zzqxtildeqq.com
000 https://rdap.nic.ar/domain/tilde.com.ar
000 https://rdap.nic.ar/domain/zzqxtildeqq.com.ar
000 https://rdap.nic.ar/domain/tilde.ar
000 https://rdap.nic.ar/domain/zzqxtildeqq.ar
000 https://www.registry.google/rdap/domain/tilde.app
000 https://pubapi.registry.google/rdap/domain/tilde.app
000 https://pubapi.registry.google/rdap/domain/zzqxtildeqq.app
000 https://dns.google/resolve?name=tilde.com&type=NS
000 https://cloudflare-dns.com/dns-query?name=tilde.com.ar&type=NS
(each one: "curl: (56) CONNECT tunnel failed, response 403")

$ curl -sS -D - -o /dev/null https://rdap.verisign.com/com/v1/domain/brainance.com
HTTP/1.1 403 Forbidden            <- proxy: "gateway answered 403 to CONNECT (policy denial or upstream failure)"

$ for h in rdap.org www.rdap.net api.domainsdb.info nic.ar www.wipo.int branddb.wipo.int tsdr.uspto.gov portaltramites.inpi.gob.ar; do curl -o /dev/null -w "%{http_code}" https://$h/; done
000 (all of them; registry.npmjs.org and pypi.org returned 200, which confirms the proxy works and that the block is per host)

$ which dig whois   -> not installed (only curl, jq and python3)

WebFetch (claude tool) -> {"error_type":"EGRESS_BLOCKED"} for: rdap.verisign.com, rdap.nic.ar, pubapi.registry.google,
  rdap.org, www.whois.com, lookup.icann.org, who.is, www.godaddy.com, porkbun.com, nic.ar, api.domainsdb.info,
  portaltramites.inpi.gob.ar, branddb.wipo.int, tmsearch.uspto.gov, tilde.com, en.wikipedia.org, www.capterra.com
```

**A.2 Alternativa que funcionó: cliente DNS mínimo en Python (stdlib), equivalente a `dig NAME NS @8.8.8.8`**

```text
$ cat /etc/resolv.conf  -> nameserver 8.8.8.8 / nameserver 8.8.4.4
$ getent hosts tilde.com        -> 20.234.32.111 tilde.com
$ getent hosts zzqxtildeqq.com  -> (rc=2, no existe)

Controles (10:42 UTC):
$ python3 -I dnsq.py tilde.com NS        -> NOERROR answer: ns1-09.azure-dns.com, ns2-09.azure-dns.net, ns3-09.azure-dns.org, ns4-09.azure-dns.info
$ python3 -I dnsq.py zzqxtildeqq.com NS  -> NXDOMAIN authority: com. SOA a.gtld-servers.net.
$ python3 -I dnsq.py brainance.com NS    -> NOERROR answer: coco.bunny.net, kiki.bunny.net
$ python3 -I dnsq.py com.ar NS           -> NOERROR: c/d/e/f.dns.ar, a.lactld.org
$ python3 -I dnsq.py app NS              -> NOERROR: ns-tld1..5.charlestonroadregistry.com

Consultas autoritativas directas (descartadas por intercepción):
$ python3 -I dnsq.py tilde.com NS 192.5.6.30 norec           -> SERVFAIL
$ python3 -I dnsq.py zzqxtildeqq.com NS 192.5.6.30 norec     -> SERVFAIL
$ python3 -I dnsq.py tilde.com.ar NS 200.108.148.50 norec    -> SERVFAIL
$ python3 -I dnsq.py tilde.app NS 216.239.32.105 norec       -> SERVFAIL

Reintentos de SERVFAIL/timeout (10:45 UTC; NS a 8.8.8.8, SOA a 8.8.4.4, A a 8.8.8.8):
responde.com, siempreatento.com, cadete.com, tucadete.com, campana.com.ar, elfaro.ar, aloalo.app, contesta.app, tuturno.com.ar
  -> SERVFAIL en las tres consultas, para todos
```

Script `dnsq.py` (cliente DNS):

```python
#!/usr/bin/env python3
"""Minimal stdlib DNS client (equivalent to `dig [+norec] @server NAME TYPE`)."""
import socket, struct, random, sys

TYPES = {'A':1,'NS':2,'CNAME':5,'SOA':6,'TXT':16,'AAAA':28}
RTYPES = {v:k for k,v in TYPES.items()}
RCODES = {0:'NOERROR',1:'FORMERR',2:'SERVFAIL',3:'NXDOMAIN',4:'NOTIMP',5:'REFUSED'}

def build(name, qtype, rd=True):
    qid = random.randint(0, 65535)
    flags = 0x0100 if rd else 0x0000
    hdr = struct.pack('>HHHHHH', qid, flags, 1, 0, 0, 0)
    q = b''.join(bytes([len(p)]) + p.encode('ascii') for p in name.strip('.').split('.')) + b'\x00'
    return qid, hdr + q + struct.pack('>HH', TYPES[qtype], 1)

def read_name(msg, off):
    labels = []; jumped = False; end = off
    while True:
        l = msg[off]
        if l & 0xC0 == 0xC0:
            ptr = struct.unpack('>H', msg[off:off+2])[0] & 0x3FFF
            if not jumped: end = off + 2
            jumped = True; off = ptr; continue
        if l == 0:
            if not jumped: end = off + 1
            break
        labels.append(msg[off+1:off+1+l].decode('ascii', 'replace')); off += 1 + l
    return '.'.join(labels) + '.', end

def parse(msg):
    qid, flags, qd, an, ns, ar = struct.unpack('>HHHHHH', msg[:12])
    off = 12
    for _ in range(qd):
        _, off = read_name(msg, off); off += 4
    secs = {}
    for sec, cnt in (('answer', an), ('authority', ns), ('additional', ar)):
        recs = []
        for _ in range(cnt):
            name, off = read_name(msg, off)
            t, c, ttl, rdlen = struct.unpack('>HHIH', msg[off:off+10]); off += 10
            rd = msg[off:off+rdlen]
            if t in (2, 5): val, _ = read_name(msg, off)
            elif t == 1: val = socket.inet_ntoa(rd)
            elif t == 6:
                mname, o2 = read_name(msg, off); val = 'SOA ' + mname
            else: val = rd.hex()[:40]
            recs.append((name, RTYPES.get(t, t), val)); off += rdlen
        secs[sec] = recs
    return {'rcode': RCODES.get(flags & 0xF, flags & 0xF), 'aa': bool(flags & 0x0400), **secs}

def query(name, qtype='NS', server='8.8.8.8', rd=True, timeout=4, tries=3):
    for _ in range(tries):
        qid, pkt = build(name, qtype, rd)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.settimeout(timeout)
        try:
            s.sendto(pkt, (server, 53)); data, _ = s.recvfrom(4096)
            return parse(data)
        except socket.timeout:
            continue
        finally:
            s.close()
    return {'rcode': 'TIMEOUT', 'answer': [], 'authority': [], 'additional': []}

if __name__ == '__main__':
    name = sys.argv[1]; qtype = sys.argv[2] if len(sys.argv) > 2 else 'NS'
    server = sys.argv[3] if len(sys.argv) > 3 else '8.8.8.8'
    rd = not (len(sys.argv) > 4 and sys.argv[4] == 'norec')
    r = query(name, qtype, server, rd)
    print(r['rcode'], 'aa' if r['aa'] else '', r)
```

Script `sweep.py` (barrido de las 600 combinaciones; corrida: `python3 -I sweep.py <dir_tools> sweep.json`, salida `2026-10-08T10:43:27Z 2026-10-08T10:44:08Z 600`):

```python
#!/usr/bin/env python3
import sys, json, time, datetime
sys.path.insert(0, sys.argv[1])
from dnsq import query
from concurrent.futures import ThreadPoolExecutor

SEEDS = {
 'tilde':['contilde','tutilde'], 'recado':['elrecado','turecado'], 'sereno':['elsereno','tusereno'],
 'timbre':['eltimbre','tutimbre'], 'mostrador':['elmostrador','tumostrador'], 'atento':['siempreatento','tuatento'],
 'deturno':['estadeturno','eldeturno'], 'encargado':['elencargado','tuencargado'], 'cadete':['elcadete','tucadete'],
 'portero':['elportero','tuportero'], 'presente':['siemprepresente','estoypresente'], 'campana':['lacampana','tucampana'],
 'avisa':['avisame','teavisa'], 'atendido':['bienatendido','tenesatendido'], 'abierto':['siempreabierto','estamosabiertos'],
 'vigia':['elvigia','tuvigia'], 'faro':['elfaro','tufaro'], 'alo':['aloalo','decialo'],
 'contesta':['contestame','tecontesta'], 'responde':['teresponde','respondeme'], 'siempre':['siempreahi','siempreesta'],
 'mostra':['mostrame','mostrala'], 'turno':['tuturno','sinesperas'], 'guardia':['deguardia','laguardia'],
}
TLDS = ['com','com.ar','ar','app']
PARK = {'dan.com':'Dan.com','sedoparking':'Sedo parking','afternic':'Afternic','bodis':'Bodis','parkingcrew':'ParkingCrew',
        'above.com':'Above.com','hugedomains':'HugeDomains','uniregistrymarket':'Uniregistry market','atom.com':'Atom','squadhelp':'Atom/Squadhelp',
        'parklogic':'ParkLogic','namebright':'NameBright(parking common)','undeveloped':'Undeveloped','domainmarket':'DomainMarket',
        'brandbucket':'BrandBucket','efty':'Efty','voodoo':'Voodoo parking','cashparking':'GoDaddy CashParking','smartname':'Sedo/SmartName',
        'ztomy':'Ztomy parking','park.do':'park.do','parked':'parked','dsredirection':'DSRedirect parking','dnspark':'dnspark'}

rows = []
for seed, comps in SEEDS.items():
    for v in [seed, 'hola'+seed, seed+'app', 'mi'+seed]:
        for t in TLDS: rows.append((seed, v, t))
    rows.append((seed, 'get'+seed, 'com'))
    for c in comps:
        for t in TLDS: rows.append((seed, c, t))

def check(r):
    seed, label, tld = r; dom = f'{label}.{tld}'
    a = query(dom, 'NS', '8.8.8.8')
    ns = [x[2] for x in a['answer'] if x[1] == 'NS']
    rc = a['rcode']
    b = None
    if rc != 'NOERROR' or not ns:
        b = query(dom, 'NS', '8.8.4.4')
    ip = []
    if ns or rc == 'SERVFAIL':
        aa = query(dom, 'A', '8.8.8.8'); ip = [x[2] for x in aa['answer'] if x[1] == 'A']
    if ns: st = 'REGISTERED (delegated)'
    elif rc == 'NXDOMAIN' and (b is None or b['rcode'] == 'NXDOMAIN'): st = 'NXDOMAIN'
    elif rc == 'SERVFAIL': st = 'SERVFAIL (likely registered, lame NS)'
    else: st = f'OTHER {rc}/{b["rcode"] if b else ""}'
    park = sorted({v for k, v in PARK.items() if any(k in n.lower() for n in ns)})
    return dict(seed=seed, domain=dom, rc1=rc, rc2=(b['rcode'] if b else ''), ns=ns, a=ip, status=st, parking=park)

start = datetime.datetime.utcnow().isoformat(timespec='seconds') + 'Z'
with ThreadPoolExecutor(12) as ex: res = list(ex.map(check, rows))
end = datetime.datetime.utcnow().isoformat(timespec='seconds') + 'Z'
json.dump({'start': start, 'end': end, 'results': res}, open(sys.argv[2], 'w'), indent=1)
print(start, end, len(res))
```

**A.3 Salida cruda del barrido (600 filas).** Por cada dominio: rcode de NS a 8.8.8.8, rcode de NS a 8.8.4.4 (solo se consultó si el primero no dio NS), los primeros 2 NS y los primeros 2 registros A.

| Dominio | rcode 8.8.8.8 | rcode 8.8.4.4 | NS (hasta 2) | A (hasta 2) |
|---|---|---|---|---|
| tilde.com | NOERROR | - | ns2-09.azure-dns.net, ns4-09.azure-dns.info | 20.234.32.111 |
| tilde.com.ar | NOERROR | - | ns2.serverilusionideas.com, ns1.serverilusionideas.com | 68.178.202.156 |
| tilde.ar | NOERROR | - | ns-751.awsdns-29.net, ns-271.awsdns-33.com | 185.133.35.13, 185.133.35.14 |
| tilde.app | NOERROR | - | ns2.aftermarket.com, ns1.aftermarket.com | 3.33.224.147 |
| holatilde.com | NXDOMAIN | NXDOMAIN | - | - |
| holatilde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holatilde.ar | NXDOMAIN | NXDOMAIN | - | - |
| holatilde.app | NXDOMAIN | NXDOMAIN | - | - |
| tildeapp.com | NOERROR | - | ns2.register.it, ns1.register.it | 194.116.72.74 |
| tildeapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tildeapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| tildeapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mitilde.com | NXDOMAIN | NXDOMAIN | - | - |
| mitilde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mitilde.ar | NXDOMAIN | NXDOMAIN | - | - |
| mitilde.app | NXDOMAIN | NXDOMAIN | - | - |
| gettilde.com | NOERROR | - | nsg2.namebrightdns.com, nsg1.namebrightdns.com | 52.201.53.166, 98.82.42.139 |
| contilde.com | NXDOMAIN | NXDOMAIN | - | - |
| contilde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| contilde.ar | NXDOMAIN | NXDOMAIN | - | - |
| contilde.app | NXDOMAIN | NXDOMAIN | - | - |
| tutilde.com | NXDOMAIN | NXDOMAIN | - | - |
| tutilde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tutilde.ar | NXDOMAIN | NXDOMAIN | - | - |
| tutilde.app | NXDOMAIN | NXDOMAIN | - | - |
| recado.com | NOERROR | - | damao.ns.giantpanda.com, yangguang.ns.giantpanda.com | 66.175.209.179, 45.79.167.180 |
| recado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| recado.ar | NXDOMAIN | NXDOMAIN | - | - |
| recado.app | NOERROR | - | ns-769.awsdns-32.net, ns-1607.awsdns-08.co.uk | - |
| holarecado.com | NXDOMAIN | NXDOMAIN | - | - |
| holarecado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holarecado.ar | NXDOMAIN | NXDOMAIN | - | - |
| holarecado.app | NXDOMAIN | NXDOMAIN | - | - |
| recadoapp.com | NOERROR | - | amy.ns.cloudflare.com, greg.ns.cloudflare.com | 104.21.43.16, 172.67.215.216 |
| recadoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| recadoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| recadoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mirecado.com | NOERROR | - | paul.ns.cloudflare.com, nova.ns.cloudflare.com | - |
| mirecado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mirecado.ar | NXDOMAIN | NXDOMAIN | - | - |
| mirecado.app | NXDOMAIN | NXDOMAIN | - | - |
| getrecado.com | NXDOMAIN | NXDOMAIN | - | - |
| elrecado.com | NOERROR | - | NS1.DOMAINRECOVER.com, NS2.DOMAINRECOVER.com | 66.45.246.141 |
| elrecado.com.ar | NOERROR | - | ns2.webhosting-network-services.com, ns1.webhosting-network-services.com | 23.227.176.14 |
| elrecado.ar | NXDOMAIN | NXDOMAIN | - | - |
| elrecado.app | NXDOMAIN | NXDOMAIN | - | - |
| turecado.com | NOERROR | - | ns4.gestiondecuenta.com, ns2.gestiondecuenta.com | 82.98.135.44 |
| turecado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| turecado.ar | NXDOMAIN | NXDOMAIN | - | - |
| turecado.app | NXDOMAIN | NXDOMAIN | - | - |
| sereno.com | NOERROR | - | ns-840.awsdns-41.net, ns-1698.awsdns-20.co.uk | 52.21.38.143, 34.230.139.101 |
| sereno.com.ar | NOERROR | - | dns1.p03.nsone.net, dns3.p03.nsone.net | 18.208.88.157, 98.84.224.111 |
| sereno.ar | NXDOMAIN | NXDOMAIN | - | - |
| sereno.app | NOERROR | - | martin.ns.cloudflare.com, nelci.ns.cloudflare.com | 172.67.187.154, 104.21.7.145 |
| holasereno.com | NXDOMAIN | NXDOMAIN | - | - |
| holasereno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holasereno.ar | NXDOMAIN | NXDOMAIN | - | - |
| holasereno.app | NXDOMAIN | NXDOMAIN | - | - |
| serenoapp.com | NOERROR | - | arya.ns.cloudflare.com, mitch.ns.cloudflare.com | 172.67.200.229, 104.21.44.150 |
| serenoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| serenoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| serenoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| misereno.com | NOERROR | - | ns2.directnic.com, ns3.directnic.com | 104.143.9.211, 104.143.9.210 |
| misereno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| misereno.ar | NXDOMAIN | NXDOMAIN | - | - |
| misereno.app | NXDOMAIN | NXDOMAIN | - | - |
| getsereno.com | NOERROR | - | sam.ns.cloudflare.com, zara.ns.cloudflare.com | - |
| elsereno.com | NOERROR | - | ns1.abovedomains.com, ns2.abovedomains.com | 103.224.182.246 |
| elsereno.com.ar | NOERROR | - | ns1.erconsultor.com, ns2.erconsultor.com | 144.91.77.221 |
| elsereno.ar | NOERROR | - | nora.ns.cloudflare.com, coby.ns.cloudflare.com | - |
| elsereno.app | NOERROR | - | dns98.servidoresdns.net, dns97.servidoresdns.net | 217.160.0.89 |
| tusereno.com | NOERROR | - | athena.dns-parking.com, apollo.dns-parking.com | 2.57.91.91 |
| tusereno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tusereno.ar | NXDOMAIN | NXDOMAIN | - | - |
| tusereno.app | NXDOMAIN | NXDOMAIN | - | - |
| timbre.com | NOERROR | - | ns2.hover.com, ns1.hover.com | 216.40.34.41 |
| timbre.com.ar | NOERROR | - | dana.ns.cloudflare.com, damien.ns.cloudflare.com | 172.67.142.25, 104.21.46.209 |
| timbre.ar | NOERROR | - | autumn.ns.cloudflare.com, donovan.ns.cloudflare.com | - |
| timbre.app | NOERROR | - | launch2.spaceship.net, launch1.spaceship.net | 44.232.173.249, 52.40.42.113 |
| holatimbre.com | NOERROR | - | ns2.renewyourname.net, ns1.renewyourname.net | 52.223.13.41 |
| holatimbre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holatimbre.ar | NXDOMAIN | NXDOMAIN | - | - |
| holatimbre.app | NXDOMAIN | NXDOMAIN | - | - |
| timbreapp.com | NOERROR | - | elaine.ns.cloudflare.com, houston.ns.cloudflare.com | 172.67.190.93, 104.21.57.121 |
| timbreapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| timbreapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| timbreapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mitimbre.com | NOERROR | - | nsg2.namebrightdns.com, nsg1.namebrightdns.com | 13.223.25.84, 54.243.117.197 |
| mitimbre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mitimbre.ar | NXDOMAIN | NXDOMAIN | - | - |
| mitimbre.app | NXDOMAIN | NXDOMAIN | - | - |
| gettimbre.com | NOERROR | - | ns61.domaincontrol.com, ns62.domaincontrol.com | 13.248.213.45, 76.223.67.189 |
| eltimbre.com | NOERROR | - | ns1.im-global.net, ns2.im-global.net | 207.58.172.178 |
| eltimbre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| eltimbre.ar | NXDOMAIN | NXDOMAIN | - | - |
| eltimbre.app | NXDOMAIN | NXDOMAIN | - | - |
| tutimbre.com | NXDOMAIN | NXDOMAIN | - | - |
| tutimbre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tutimbre.ar | NXDOMAIN | NXDOMAIN | - | - |
| tutimbre.app | NXDOMAIN | NXDOMAIN | - | - |
| mostrador.com | NOERROR | - | ns4.afternic.com, ns3.afternic.com | 13.248.169.48, 76.223.54.146 |
| mostrador.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostrador.ar | NOERROR | - | ns1.vercel-dns.com, ns2.vercel-dns.com | 64.29.17.65, 216.198.79.65 |
| mostrador.app | NOERROR | - | ns2ckr.name.com, ns3jkl.name.com | 34.111.179.208 |
| holamostrador.com | NXDOMAIN | NXDOMAIN | - | - |
| holamostrador.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holamostrador.ar | NXDOMAIN | NXDOMAIN | - | - |
| holamostrador.app | NXDOMAIN | NXDOMAIN | - | - |
| mostradorapp.com | NXDOMAIN | NXDOMAIN | - | - |
| mostradorapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostradorapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostradorapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mimostrador.com | NOERROR | - | ns245.neubox.net, ns143.neubox.net | 198.59.144.133 |
| mimostrador.com.ar | NOERROR | - | ns2.donweb.com, ns1.donweb.com | 216.198.79.1 |
| mimostrador.ar | NXDOMAIN | NXDOMAIN | - | - |
| mimostrador.app | NOERROR | - | ns3fhx.name.com, ns1dhl.name.com | 91.195.240.94 |
| getmostrador.com | NXDOMAIN | NXDOMAIN | - | - |
| elmostrador.com | NOERROR | - | ns2.parkingcrew.net, ns1.parkingcrew.net | 104.247.81.99 |
| elmostrador.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| elmostrador.ar | NXDOMAIN | NXDOMAIN | - | - |
| elmostrador.app | NOERROR | - | ns2.vercel-dns.com, ns1.vercel-dns.com | 216.198.79.65, 64.29.17.65 |
| tumostrador.com | NOERROR | - | ns44.domaincontrol.com, ns43.domaincontrol.com | 3.33.130.190, 15.197.148.33 |
| tumostrador.com.ar | NOERROR | - | jaziel.ns.cloudflare.com, kayleigh.ns.cloudflare.com | 216.24.57.18, 216.24.57.16 |
| tumostrador.ar | NXDOMAIN | NXDOMAIN | - | - |
| tumostrador.app | NXDOMAIN | NXDOMAIN | - | - |
| atento.com | NOERROR | - | ns4-02.azure-dns.info, ns3-02.azure-dns.org | 20.122.54.115 |
| atento.com.ar | NOERROR | - | dns1.atento.com.ar, dns2.atento.com.ar | 167.99.115.103 |
| atento.ar | NXDOMAIN | NXDOMAIN | - | - |
| atento.app | NXDOMAIN | NXDOMAIN | - | - |
| holaatento.com | NXDOMAIN | NXDOMAIN | - | - |
| holaatento.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaatento.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaatento.app | NXDOMAIN | NXDOMAIN | - | - |
| atentoapp.com | NOERROR | - | ns37.domaincontrol.com, ns38.domaincontrol.com | 15.197.148.33, 3.33.130.190 |
| atentoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| atentoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| atentoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miatento.com | NOERROR | - | ns3.hostmar.com, ns4.hostmar.com | 200.58.111.131 |
| miatento.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miatento.ar | NXDOMAIN | NXDOMAIN | - | - |
| miatento.app | NXDOMAIN | NXDOMAIN | - | - |
| getatento.com | NXDOMAIN | NXDOMAIN | - | - |
| siempreatento.com | SERVFAIL | SERVFAIL | - | - |
| siempreatento.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreatento.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreatento.app | NXDOMAIN | NXDOMAIN | - | - |
| tuatento.com | NXDOMAIN | NXDOMAIN | - | - |
| tuatento.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuatento.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuatento.app | NXDOMAIN | NXDOMAIN | - | - |
| deturno.com | NOERROR | - | ns2.afternic.com, ns1.afternic.com | 13.248.169.48, 76.223.54.146 |
| deturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| deturno.ar | NOERROR | - | hayes.ns.cloudflare.com, maeve.ns.cloudflare.com | 104.21.12.176, 172.67.195.41 |
| deturno.app | NOERROR | - | kia.ns.cloudflare.com, damiete.ns.cloudflare.com | 104.21.89.192, 172.67.191.10 |
| holadeturno.com | NXDOMAIN | NXDOMAIN | - | - |
| holadeturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holadeturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| holadeturno.app | NXDOMAIN | NXDOMAIN | - | - |
| deturnoapp.com | NXDOMAIN | NXDOMAIN | - | - |
| deturnoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| deturnoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| deturnoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mideturno.com | NXDOMAIN | NXDOMAIN | - | - |
| mideturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mideturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| mideturno.app | NXDOMAIN | NXDOMAIN | - | - |
| getdeturno.com | NXDOMAIN | NXDOMAIN | - | - |
| estadeturno.com | NXDOMAIN | NXDOMAIN | - | - |
| estadeturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| estadeturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| estadeturno.app | NXDOMAIN | NXDOMAIN | - | - |
| eldeturno.com | NXDOMAIN | NXDOMAIN | - | - |
| eldeturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| eldeturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| eldeturno.app | NXDOMAIN | NXDOMAIN | - | - |
| encargado.com | NOERROR | - | ns2.abovedomains.com, ns1.abovedomains.com | 103.224.182.246 |
| encargado.com.ar | NOERROR | - | rosalyn.ns.cloudflare.com, kip.ns.cloudflare.com | - |
| encargado.ar | NXDOMAIN | NXDOMAIN | - | - |
| encargado.app | NXDOMAIN | NXDOMAIN | - | - |
| holaencargado.com | NXDOMAIN | NXDOMAIN | - | - |
| holaencargado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaencargado.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaencargado.app | NXDOMAIN | NXDOMAIN | - | - |
| encargadoapp.com | NXDOMAIN | NXDOMAIN | - | - |
| encargadoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| encargadoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| encargadoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miencargado.com | NOERROR | - | adi.ns.cloudflare.com, sri.ns.cloudflare.com | - |
| miencargado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miencargado.ar | NXDOMAIN | NXDOMAIN | - | - |
| miencargado.app | NXDOMAIN | NXDOMAIN | - | - |
| getencargado.com | NXDOMAIN | NXDOMAIN | - | - |
| elencargado.com | NOERROR | - | ns2.dns-parking.com, ns1.dns-parking.com | 145.223.124.96, 88.223.87.19 |
| elencargado.com.ar | NOERROR | - | ns1.vercel-dns.com, ns2.vercel-dns.com | 64.29.17.1, 216.198.79.1 |
| elencargado.ar | NXDOMAIN | NXDOMAIN | - | - |
| elencargado.app | NOERROR | - | ns1.vercel-dns.com, ns2.vercel-dns.com | 64.29.17.65, 216.198.79.65 |
| tuencargado.com | NOERROR | - | nsd3.squarespacedns.com, nsd2.squarespacedns.com | 198.185.159.144, 198.49.23.144 |
| tuencargado.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuencargado.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuencargado.app | NXDOMAIN | NXDOMAIN | - | - |
| cadete.com | SERVFAIL | SERVFAIL | - | - |
| cadete.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| cadete.ar | NXDOMAIN | NXDOMAIN | - | - |
| cadete.app | NXDOMAIN | NXDOMAIN | - | - |
| holacadete.com | NXDOMAIN | NXDOMAIN | - | - |
| holacadete.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacadete.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacadete.app | NXDOMAIN | NXDOMAIN | - | - |
| cadeteapp.com | NXDOMAIN | NXDOMAIN | - | - |
| cadeteapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| cadeteapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| cadeteapp.app | NXDOMAIN | NXDOMAIN | - | - |
| micadete.com | NXDOMAIN | NXDOMAIN | - | - |
| micadete.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| micadete.ar | NXDOMAIN | NXDOMAIN | - | - |
| micadete.app | NXDOMAIN | NXDOMAIN | - | - |
| getcadete.com | NXDOMAIN | NXDOMAIN | - | - |
| elcadete.com | NOERROR | - | ns2.afternic.com, ns1.afternic.com | 13.248.169.48, 76.223.54.146 |
| elcadete.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| elcadete.ar | NXDOMAIN | NXDOMAIN | - | - |
| elcadete.app | NXDOMAIN | NXDOMAIN | - | - |
| tucadete.com | SERVFAIL | SERVFAIL | - | - |
| tucadete.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tucadete.ar | NXDOMAIN | NXDOMAIN | - | - |
| tucadete.app | NXDOMAIN | NXDOMAIN | - | - |
| portero.com | NOERROR | - | ns3.dnsmadeeasy.com, ns1.dnsmadeeasy.com | 206.188.193.205 |
| portero.com.ar | NOERROR | - | ns1.mydomain.com, ns2.mydomain.com | - |
| portero.ar | NXDOMAIN | NXDOMAIN | - | - |
| portero.app | NOERROR | - | ns22.domaincontrol.com, ns21.domaincontrol.com | 3.33.130.190, 15.197.148.33 |
| holaportero.com | NXDOMAIN | NXDOMAIN | - | - |
| holaportero.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaportero.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaportero.app | NXDOMAIN | NXDOMAIN | - | - |
| porteroapp.com | NOERROR | - | ns2.dreamhost.com, ns3.dreamhost.com | - |
| porteroapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| porteroapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| porteroapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miportero.com | NOERROR | - | ns1.donweb.com, ns2.donweb.com | 66.97.47.165 |
| miportero.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miportero.ar | NXDOMAIN | NXDOMAIN | - | - |
| miportero.app | NOERROR | - | ns2.vercel-dns.com, ns1.vercel-dns.com | 216.150.16.193, 216.150.1.129 |
| getportero.com | NXDOMAIN | NXDOMAIN | - | - |
| elportero.com | NOERROR | - | nsg1.namebrightdns.com, nsg2.namebrightdns.com | 13.223.25.84, 54.243.117.197 |
| elportero.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| elportero.ar | NXDOMAIN | NXDOMAIN | - | - |
| elportero.app | NXDOMAIN | NXDOMAIN | - | - |
| tuportero.com | NOERROR | - | ns50.domaincontrol.com, ns49.domaincontrol.com | 3.33.130.190, 15.197.148.33 |
| tuportero.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuportero.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuportero.app | NOERROR | - | ns1093.ui-dns.de, ns1100.ui-dns.org | 74.208.236.114 |
| presente.com | NOERROR | - | ns2.namefind.com, ns1.namefind.com | 13.248.169.48, 76.223.54.146 |
| presente.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| presente.ar | NOERROR | - | dns1.p03.nsone.net, dns4.p03.nsone.net | 98.84.224.111, 18.208.88.157 |
| presente.app | NXDOMAIN | NXDOMAIN | - | - |
| holapresente.com | NOERROR | - | ns28.domaincontrol.com, ns27.domaincontrol.com | 15.197.148.33, 3.33.130.190 |
| holapresente.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holapresente.ar | NXDOMAIN | NXDOMAIN | - | - |
| holapresente.app | NXDOMAIN | NXDOMAIN | - | - |
| presenteapp.com | NOERROR | - | ns70.domaincontrol.com, ns69.domaincontrol.com | 76.223.105.230, 13.248.243.5 |
| presenteapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| presenteapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| presenteapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mipresente.com | NXDOMAIN | NXDOMAIN | - | - |
| mipresente.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mipresente.ar | NXDOMAIN | NXDOMAIN | - | - |
| mipresente.app | NXDOMAIN | NXDOMAIN | - | - |
| getpresente.com | NXDOMAIN | NXDOMAIN | - | - |
| siemprepresente.com | NOERROR | - | ns1.afternic.com, ns2.afternic.com | 76.223.54.146, 13.248.169.48 |
| siemprepresente.com.ar | NOERROR | - | ns2.mesi.com.ar, ns1.mesi.com.ar | 181.225.136.140 |
| siemprepresente.ar | NXDOMAIN | NXDOMAIN | - | - |
| siemprepresente.app | NXDOMAIN | NXDOMAIN | - | - |
| estoypresente.com | NOERROR | - | ns34.domaincontrol.com, ns33.domaincontrol.com | 3.33.251.168, 15.197.225.128 |
| estoypresente.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| estoypresente.ar | NXDOMAIN | NXDOMAIN | - | - |
| estoypresente.app | NXDOMAIN | NXDOMAIN | - | - |
| campana.com | NOERROR | - | ns1.constellationhbs.com, ns3.constellationhbs.com | 130.211.146.34 |
| campana.com.ar | SERVFAIL | SERVFAIL | - | - |
| campana.ar | NXDOMAIN | NXDOMAIN | - | - |
| campana.app | NOERROR | - | damian.ns.cloudflare.com, heidi.ns.cloudflare.com | - |
| holacampana.com | NXDOMAIN | NXDOMAIN | - | - |
| holacampana.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacampana.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacampana.app | NXDOMAIN | NXDOMAIN | - | - |
| campanaapp.com | NXDOMAIN | NXDOMAIN | - | - |
| campanaapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| campanaapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| campanaapp.app | NXDOMAIN | NXDOMAIN | - | - |
| micampana.com | NXDOMAIN | NXDOMAIN | - | - |
| micampana.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| micampana.ar | NXDOMAIN | NXDOMAIN | - | - |
| micampana.app | NXDOMAIN | NXDOMAIN | - | - |
| getcampana.com | NOERROR | - | wanda.ns.cloudflare.com, jerome.ns.cloudflare.com | 35.71.142.77, 52.223.52.2 |
| lacampana.com | NOERROR | - | ns2.sedoparking.com, ns1.sedoparking.com | 64.190.63.222 |
| lacampana.com.ar | NOERROR | - | eric.ns.cloudflare.com, elaine.ns.cloudflare.com | 172.67.207.99, 104.21.61.78 |
| lacampana.ar | NXDOMAIN | NXDOMAIN | - | - |
| lacampana.app | NOERROR | - | ns1.vercel-dns.com, ns2.vercel-dns.com | 216.150.16.193, 216.150.16.1 |
| tucampana.com | NXDOMAIN | NXDOMAIN | - | - |
| tucampana.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tucampana.ar | NXDOMAIN | NXDOMAIN | - | - |
| tucampana.app | NXDOMAIN | NXDOMAIN | - | - |
| avisa.com | NOERROR | - | damao.ns.giantpanda.com, yangguang.ns.giantpanda.com | 66.175.209.179, 45.79.167.180 |
| avisa.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisa.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisa.app | NXDOMAIN | NXDOMAIN | - | - |
| holaavisa.com | NXDOMAIN | NXDOMAIN | - | - |
| holaavisa.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaavisa.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaavisa.app | NXDOMAIN | NXDOMAIN | - | - |
| avisaapp.com | NXDOMAIN | NXDOMAIN | - | - |
| avisaapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisaapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisaapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miavisa.com | NOERROR | - | ns2002.neothek.com, ns2001.neothek.com | 67.225.151.15 |
| miavisa.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miavisa.ar | NXDOMAIN | NXDOMAIN | - | - |
| miavisa.app | NXDOMAIN | NXDOMAIN | - | - |
| getavisa.com | NOERROR | - | amalia.ns.cloudflare.com, rex.ns.cloudflare.com | 104.21.51.196, 172.67.185.125 |
| avisame.com | NOERROR | - | ns1.parkingcrew.net, ns2.parkingcrew.net | 104.247.81.99 |
| avisame.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisame.ar | NXDOMAIN | NXDOMAIN | - | - |
| avisame.app | NOERROR | - | ganz.ns.cloudflare.com, amber.ns.cloudflare.com | 172.67.177.171, 104.21.17.164 |
| teavisa.com | NOERROR | - | ns73.domaincontrol.com, ns74.domaincontrol.com | 192.145.237.182 |
| teavisa.com.ar | NOERROR | - | ns-971.awsdns-57.net, ns-228.awsdns-28.com | 54.20.145.37, 56.125.60.169 |
| teavisa.ar | NXDOMAIN | NXDOMAIN | - | - |
| teavisa.app | NXDOMAIN | NXDOMAIN | - | - |
| atendido.com | NOERROR | - | ns26.domaincontrol.com, ns25.domaincontrol.com | 3.33.251.168, 15.197.225.128 |
| atendido.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| atendido.ar | NXDOMAIN | NXDOMAIN | - | - |
| atendido.app | NOERROR | - | joyce.ns.cloudflare.com, ruben.ns.cloudflare.com | 204.93.224.72 |
| holaatendido.com | NXDOMAIN | NXDOMAIN | - | - |
| holaatendido.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaatendido.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaatendido.app | NXDOMAIN | NXDOMAIN | - | - |
| atendidoapp.com | NXDOMAIN | NXDOMAIN | - | - |
| atendidoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| atendidoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| atendidoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miatendido.com | NXDOMAIN | NXDOMAIN | - | - |
| miatendido.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miatendido.ar | NXDOMAIN | NXDOMAIN | - | - |
| miatendido.app | NXDOMAIN | NXDOMAIN | - | - |
| getatendido.com | NXDOMAIN | NXDOMAIN | - | - |
| bienatendido.com | NOERROR | - | kayden.ns.cloudflare.com, annalise.ns.cloudflare.com | 172.67.203.247, 104.21.37.50 |
| bienatendido.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| bienatendido.ar | NXDOMAIN | NXDOMAIN | - | - |
| bienatendido.app | NXDOMAIN | NXDOMAIN | - | - |
| tenesatendido.com | NXDOMAIN | NXDOMAIN | - | - |
| tenesatendido.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tenesatendido.ar | NXDOMAIN | NXDOMAIN | - | - |
| tenesatendido.app | NXDOMAIN | NXDOMAIN | - | - |
| abierto.com | NOERROR | - | ns2.dyna-ns.net, ns1.dyna-ns.net | 188.214.128.77 |
| abierto.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| abierto.ar | NXDOMAIN | NXDOMAIN | - | - |
| abierto.app | NOERROR | - | sureena.ns.cloudflare.com, kenneth.ns.cloudflare.com | 172.67.165.194, 104.21.81.230 |
| holaabierto.com | NXDOMAIN | NXDOMAIN | - | - |
| holaabierto.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaabierto.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaabierto.app | NXDOMAIN | NXDOMAIN | - | - |
| abiertoapp.com | NXDOMAIN | NXDOMAIN | - | - |
| abiertoapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| abiertoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| abiertoapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miabierto.com | NXDOMAIN | NXDOMAIN | - | - |
| miabierto.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miabierto.ar | NXDOMAIN | NXDOMAIN | - | - |
| miabierto.app | NXDOMAIN | NXDOMAIN | - | - |
| getabierto.com | NXDOMAIN | NXDOMAIN | - | - |
| siempreabierto.com | NOERROR | - | expire1.gname-dns.com, expire2.gname-dns.com | 172.65.211.209 |
| siempreabierto.com.ar | NOERROR | - | ns3.hostmar.com, ns4.hostmar.com | 200.58.112.72 |
| siempreabierto.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreabierto.app | NOERROR | - | ns9.hostmar.com, ns10.hostmar.com | 149.50.131.72 |
| estamosabiertos.com | NOERROR | - | ns1.abovedomains.com, ns2.abovedomains.com | 103.224.182.253 |
| estamosabiertos.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| estamosabiertos.ar | NXDOMAIN | NXDOMAIN | - | - |
| estamosabiertos.app | NXDOMAIN | NXDOMAIN | - | - |
| vigia.com | NOERROR | - | ns3.dnsmadeeasy.com, ns4.dnsmadeeasy.com | 34.174.97.209 |
| vigia.com.ar | NOERROR | - | ns1.dnsmadeeasy.com, ns3.dnsmadeeasy.com | 96.45.82.20, 96.45.83.104 |
| vigia.ar | NXDOMAIN | NXDOMAIN | - | - |
| vigia.app | NOERROR | - | ns1.intercloud.es, ns3.intercloud.es | - |
| holavigia.com | NXDOMAIN | NXDOMAIN | - | - |
| holavigia.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holavigia.ar | NXDOMAIN | NXDOMAIN | - | - |
| holavigia.app | NXDOMAIN | NXDOMAIN | - | - |
| vigiaapp.com | NOERROR | - | thaddeus.ns.cloudflare.com, adele.ns.cloudflare.com | 104.21.52.208, 172.67.203.230 |
| vigiaapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| vigiaapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| vigiaapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mivigia.com | NOERROR | - | ns1.dreamhost.com, ns2.dreamhost.com | 67.205.6.255 |
| mivigia.com.ar | NOERROR | - | elliot.ns.cloudflare.com, meg.ns.cloudflare.com | - |
| mivigia.ar | NOERROR | - | christina.ns.cloudflare.com, armfazh.ns.cloudflare.com | - |
| mivigia.app | NXDOMAIN | NXDOMAIN | - | - |
| getvigia.com | NOERROR | - | ns4dmx.name.com, ns3nrz.name.com | 66.241.125.53 |
| elvigia.com | NOERROR | - | ns2.ginernet.com, ns1.ginernet.com | 5.134.119.90 |
| elvigia.com.ar | NOERROR | - | dns1.iplanisp.com.ar, dns2.iplanisp.com.ar | - |
| elvigia.ar | NXDOMAIN | NXDOMAIN | - | - |
| elvigia.app | NXDOMAIN | NXDOMAIN | - | - |
| tuvigia.com | NOERROR | - | ns-cloud-c4.googledomains.com, ns-cloud-c3.googledomains.com | 23.227.38.69 |
| tuvigia.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuvigia.ar | NXDOMAIN | NXDOMAIN | - | - |
| tuvigia.app | NOERROR | - | rita.ns.cloudflare.com, oswald.ns.cloudflare.com | 104.21.9.53, 172.67.159.29 |
| faro.com | NOERROR | - | ns3.p201.dns.oraclecloud.net, ns4.p201.dns.oraclecloud.net | 20.42.37.20 |
| faro.com.ar | NOERROR | - | ns4.afraid.org, ns3.afraid.org | 163.47.132.106 |
| faro.ar | NOERROR | - | ns.supporthost.eu, ns.supporthost.net | 5.78.87.27 |
| faro.app | NOERROR | - | jerry.ns.cloudflare.com, treasure.ns.cloudflare.com | 104.21.44.243, 172.67.205.123 |
| holafaro.com | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 76.76.21.21 |
| holafaro.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holafaro.ar | NXDOMAIN | NXDOMAIN | - | - |
| holafaro.app | NXDOMAIN | NXDOMAIN | - | - |
| faroapp.com | NOERROR | - | ns2.squadhelp.com, ns1.squadhelp.com | 52.20.84.62 |
| faroapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| faroapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| faroapp.app | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 216.198.79.1 |
| mifaro.com | NOERROR | - | ns1.afternic.com, ns2.afternic.com | 13.248.169.48, 76.223.54.146 |
| mifaro.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mifaro.ar | NXDOMAIN | NXDOMAIN | - | - |
| mifaro.app | NOERROR | - | romina.ns.cloudflare.com, yahir.ns.cloudflare.com | 172.67.189.96, 104.21.57.65 |
| getfaro.com | NOERROR | - | ns07.domaincontrol.com, ns08.domaincontrol.com | 15.197.225.128, 3.33.251.168 |
| elfaro.com | NOERROR | - | ns-cloud-c3.googledomains.com, ns-cloud-c1.googledomains.com | 198.185.159.144 |
| elfaro.com.ar | NOERROR | - | ns3.hostmar.com, ns4.hostmar.com | 185.133.35.13, 185.133.35.14 |
| elfaro.ar | SERVFAIL | SERVFAIL | - | - |
| elfaro.app | NOERROR | - | miles.ns.cloudflare.com, amanda.ns.cloudflare.com | 104.21.21.159, 172.67.199.89 |
| tufaro.com | NOERROR | - | ns3.dreamhost.com, ns2.dreamhost.com | 69.163.176.228 |
| tufaro.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tufaro.ar | NXDOMAIN | NXDOMAIN | - | - |
| tufaro.app | NXDOMAIN | NXDOMAIN | - | - |
| alo.com | NOERROR | - | ernest.ns.cloudflare.com, aron.ns.cloudflare.com | 104.18.10.233, 104.18.11.233 |
| alo.com.ar | NOERROR | - | ns5.101domain.com, ns1.101domain.com | 52.60.87.163 |
| alo.ar | NOERROR | - | ns5.101domain.com, ns2.101domain.com | 52.60.87.163 |
| alo.app | NOERROR | - | ns2.afternic.com, ns1.afternic.com | 13.248.169.48, 76.223.54.146 |
| holaalo.com | NXDOMAIN | NXDOMAIN | - | - |
| holaalo.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaalo.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaalo.app | NXDOMAIN | NXDOMAIN | - | - |
| aloapp.com | NOERROR | - | ns2.atom.com, ns1.atom.com | 52.20.84.62 |
| aloapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| aloapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| aloapp.app | NOERROR | - | fatima.ns.cloudflare.com, fred.ns.cloudflare.com | - |
| mialo.com | NOERROR | - | ns32.domaincontrol.com, ns31.domaincontrol.com | 3.33.251.168, 15.197.225.128 |
| mialo.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mialo.ar | NXDOMAIN | NXDOMAIN | - | - |
| mialo.app | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 216.198.79.1 |
| getalo.com | NOERROR | - | ns2.bdz3686s2h3d83pbbr598zhd.ns.namepros-dns.is, ns1.namepros-dns.com | 3.233.30.191 |
| aloalo.com | NOERROR | - | ns2.afternic.com, ns1.afternic.com | 13.248.169.48, 76.223.54.146 |
| aloalo.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| aloalo.ar | NXDOMAIN | NXDOMAIN | - | - |
| aloalo.app | SERVFAIL | SERVFAIL | - | - |
| decialo.com | NXDOMAIN | NXDOMAIN | - | - |
| decialo.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| decialo.ar | NXDOMAIN | NXDOMAIN | - | - |
| decialo.app | NXDOMAIN | NXDOMAIN | - | - |
| contesta.com | NOERROR | - | ns70.domaincontrol.com, ns69.domaincontrol.com | 23.185.0.1 |
| contesta.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| contesta.ar | NXDOMAIN | NXDOMAIN | - | - |
| contesta.app | SERVFAIL | SERVFAIL | - | - |
| holacontesta.com | NXDOMAIN | NXDOMAIN | - | - |
| holacontesta.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacontesta.ar | NXDOMAIN | NXDOMAIN | - | - |
| holacontesta.app | NXDOMAIN | NXDOMAIN | - | - |
| contestaapp.com | NXDOMAIN | NXDOMAIN | - | - |
| contestaapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| contestaapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| contestaapp.app | NXDOMAIN | NXDOMAIN | - | - |
| micontesta.com | NOERROR | - | dns4.supremedns.com, dns2.supremedns.com | 162.210.96.124 |
| micontesta.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| micontesta.ar | NXDOMAIN | NXDOMAIN | - | - |
| micontesta.app | NXDOMAIN | NXDOMAIN | - | - |
| getcontesta.com | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 216.198.79.1 |
| contestame.com | NOERROR | - | dns7.servidoresdns.net, dns8.servidoresdns.net | 217.76.130.209 |
| contestame.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| contestame.ar | NXDOMAIN | NXDOMAIN | - | - |
| contestame.app | NXDOMAIN | NXDOMAIN | - | - |
| tecontesta.com | NOERROR | - | ns2.dondominio.com, ns1.dondominio.com | 31.214.178.55 |
| tecontesta.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| tecontesta.ar | NXDOMAIN | NXDOMAIN | - | - |
| tecontesta.app | NXDOMAIN | NXDOMAIN | - | - |
| responde.com | TIMEOUT | TIMEOUT | - | - |
| responde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| responde.ar | NXDOMAIN | NXDOMAIN | - | - |
| responde.app | NOERROR | - | ns1126.ui-dns.biz, ns1112.ui-dns.com | 91.98.72.36 |
| holaresponde.com | NXDOMAIN | NXDOMAIN | - | - |
| holaresponde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaresponde.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaresponde.app | NXDOMAIN | NXDOMAIN | - | - |
| respondeapp.com | NOERROR | - | brady.ns.cloudflare.com, pola.ns.cloudflare.com | 172.67.142.116, 104.21.95.3 |
| respondeapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| respondeapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| respondeapp.app | NXDOMAIN | NXDOMAIN | - | - |
| miresponde.com | NXDOMAIN | NXDOMAIN | - | - |
| miresponde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miresponde.ar | NXDOMAIN | NXDOMAIN | - | - |
| miresponde.app | NXDOMAIN | NXDOMAIN | - | - |
| getresponde.com | NOERROR | - | ns2.dyna-ns.net, ns1.dyna-ns.net | 54.215.31.113 |
| teresponde.com | NOERROR | - | ns2.bluehost.com, ns1.bluehost.com | 162.241.224.146 |
| teresponde.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| teresponde.ar | NXDOMAIN | NXDOMAIN | - | - |
| teresponde.app | NXDOMAIN | NXDOMAIN | - | - |
| respondeme.com | NOERROR | - | yangguang.ns.giantpanda.com, damao.ns.giantpanda.com | 96.126.111.165, 45.79.167.180 |
| respondeme.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| respondeme.ar | NXDOMAIN | NXDOMAIN | - | - |
| respondeme.app | NXDOMAIN | NXDOMAIN | - | - |
| siempre.com | NOERROR | - | ns78.domaincontrol.com, ns77.domaincontrol.com | 15.197.148.33, 3.33.130.190 |
| siempre.com.ar | NOERROR | - | ns2.vercel-dns.com, ns1.vercel-dns.com | 64.29.17.65, 216.198.79.1 |
| siempre.ar | NOERROR | - | zahir.ns.cloudflare.com, elly.ns.cloudflare.com | 76.76.21.21 |
| siempre.app | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 192.64.119.236 |
| holasiempre.com | NXDOMAIN | NXDOMAIN | - | - |
| holasiempre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holasiempre.ar | NXDOMAIN | NXDOMAIN | - | - |
| holasiempre.app | NOERROR | - | salvador.ns.porkbun.com, maceio.ns.porkbun.com | 207.207.210.229, 207.207.210.107 |
| siempreapp.com | NXDOMAIN | NXDOMAIN | - | - |
| siempreapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreapp.app | NXDOMAIN | NXDOMAIN | - | - |
| misiempre.com | NXDOMAIN | NXDOMAIN | - | - |
| misiempre.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| misiempre.ar | NXDOMAIN | NXDOMAIN | - | - |
| misiempre.app | NXDOMAIN | NXDOMAIN | - | - |
| getsiempre.com | NOERROR | - | ns-1094.awsdns-08.org, ns-280.awsdns-35.com | - |
| siempreahi.com | NOERROR | - | ns2.vercel-dns.com, ns1.vercel-dns.com | 216.150.16.129, 216.150.16.193 |
| siempreahi.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreahi.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreahi.app | NXDOMAIN | NXDOMAIN | - | - |
| siempreesta.com | NOERROR | - | ns04.domaincontrol.com, ns03.domaincontrol.com | 3.33.130.190, 15.197.148.33 |
| siempreesta.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreesta.ar | NXDOMAIN | NXDOMAIN | - | - |
| siempreesta.app | NXDOMAIN | NXDOMAIN | - | - |
| mostra.com | NOERROR | - | ns1.eftydns.com, ns2.eftydns.com | 86.105.245.69 |
| mostra.com.ar | NOERROR | - | ns-1647.awsdns-13.co.uk, ns-366.awsdns-45.com | 185.133.35.14, 185.133.35.13 |
| mostra.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostra.app | NOERROR | - | anna.ns.cloudflare.com, dane.ns.cloudflare.com | 143.244.60.197 |
| holamostra.com | NXDOMAIN | NXDOMAIN | - | - |
| holamostra.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holamostra.ar | NXDOMAIN | NXDOMAIN | - | - |
| holamostra.app | NXDOMAIN | NXDOMAIN | - | - |
| mostraapp.com | NXDOMAIN | NXDOMAIN | - | - |
| mostraapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostraapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostraapp.app | NXDOMAIN | NXDOMAIN | - | - |
| mimostra.com | NXDOMAIN | NXDOMAIN | - | - |
| mimostra.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mimostra.ar | NXDOMAIN | NXDOMAIN | - | - |
| mimostra.app | NXDOMAIN | NXDOMAIN | - | - |
| getmostra.com | NOERROR | - | ns2fln.name.com, ns3fqs.name.com | 185.158.133.1 |
| mostrame.com | NOERROR | - | nsg1.namebrightdns.com, nsg2.namebrightdns.com | 54.243.117.197, 13.223.25.84 |
| mostrame.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostrame.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostrame.app | NXDOMAIN | NXDOMAIN | - | - |
| mostrala.com | NXDOMAIN | NXDOMAIN | - | - |
| mostrala.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostrala.ar | NXDOMAIN | NXDOMAIN | - | - |
| mostrala.app | NXDOMAIN | NXDOMAIN | - | - |
| turno.com | NOERROR | - | roxy.ns.cloudflare.com, yadiel.ns.cloudflare.com | 172.66.150.191, 104.20.23.133 |
| turno.com.ar | NOERROR | - | paul.ns.cloudflare.com, dina.ns.cloudflare.com | 172.233.174.127 |
| turno.ar | NOERROR | - | paul.ns.cloudflare.com, dina.ns.cloudflare.com | 172.233.174.127 |
| turno.app | NOERROR | - | ns2lns.name.com, ns1dnx.name.com | - |
| holaturno.com | NOERROR | - | dns1.registrar-servers.com, dns2.registrar-servers.com | 89.167.114.235 |
| holaturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaturno.app | NOERROR | - | ns2.dns-parking.com, ns1.dns-parking.com | 185.158.133.1 |
| turnoapp.com | NOERROR | - | aisha.ns.cloudflare.com, alan.ns.cloudflare.com | 172.67.206.147, 104.21.42.154 |
| turnoapp.com.ar | NOERROR | - | ns2.donweb.com, ns1.donweb.com | 216.150.1.1 |
| turnoapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| turnoapp.app | NOERROR | - | glen.ns.cloudflare.com, nancy.ns.cloudflare.com | - |
| miturno.com | NOERROR | - | ns1.sedoparking.com, ns2.sedoparking.com | 64.190.63.222 |
| miturno.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miturno.ar | NXDOMAIN | NXDOMAIN | - | - |
| miturno.app | NOERROR | - | junade.ns.cloudflare.com, rayne.ns.cloudflare.com | 172.67.136.150, 104.21.81.7 |
| getturno.com | NOERROR | - | braden.ns.cloudflare.com, love.ns.cloudflare.com | - |
| tuturno.com | NOERROR | - | nsg2.namebrightdns.com, nsg1.namebrightdns.com | 13.223.25.84, 54.243.117.197 |
| tuturno.com.ar | SERVFAIL | SERVFAIL | - | - |
| tuturno.ar | NOERROR | - | sky.ns.cloudflare.com, koa.ns.cloudflare.com | - |
| tuturno.app | NOERROR | - | ns75.domaincontrol.com, ns76.domaincontrol.com | 216.198.79.1 |
| sinesperas.com | NOERROR | - | ns1.afternic.com, ns2.afternic.com | 13.248.169.48, 76.223.54.146 |
| sinesperas.com.ar | NOERROR | - | freedns4.registrar-servers.com, freedns2.registrar-servers.com | 150.136.166.243 |
| sinesperas.ar | NXDOMAIN | NXDOMAIN | - | - |
| sinesperas.app | NXDOMAIN | NXDOMAIN | - | - |
| guardia.com | NOERROR | - | ns1.afternic.com, ns2.afternic.com | 76.223.54.146, 13.248.169.48 |
| guardia.com.ar | NOERROR | - | ns2.dns-parking.com, ns1.dns-parking.com | 88.223.87.101, 147.79.72.175 |
| guardia.ar | NOERROR | - | orbit.dns-parking.com, horizon.dns-parking.com | 145.223.124.133, 147.79.79.136 |
| guardia.app | NOERROR | - | dns1.ps5.com.br, ns1.reitec.net.br | 189.50.80.9 |
| holaguardia.com | NXDOMAIN | NXDOMAIN | - | - |
| holaguardia.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaguardia.ar | NXDOMAIN | NXDOMAIN | - | - |
| holaguardia.app | NXDOMAIN | NXDOMAIN | - | - |
| guardiaapp.com | NOERROR | - | ns02.domaincontrol.com, ns01.domaincontrol.com | 15.197.148.33, 3.33.130.190 |
| guardiaapp.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| guardiaapp.ar | NXDOMAIN | NXDOMAIN | - | - |
| guardiaapp.app | NOERROR | - | ns01.domaincontrol.com, ns02.domaincontrol.com | 3.33.130.190, 15.197.148.33 |
| miguardia.com | NOERROR | - | ns1.afternic.com, ns2.afternic.com | 76.223.54.146, 13.248.169.48 |
| miguardia.com.ar | NXDOMAIN | NXDOMAIN | - | - |
| miguardia.ar | NXDOMAIN | NXDOMAIN | - | - |
| miguardia.app | NOERROR | - | arushi.ns.cloudflare.com, emerson.ns.cloudflare.com | 216.198.79.1 |
| getguardia.com | NOERROR | - | ns1.dnsowl.com, ns2.dnsowl.com | 91.195.240.123 |
| deguardia.com | NOERROR | - | ns1.power-dns.com, ns2.power-dns.com | 15.223.110.177, 15.175.2.141 |
| deguardia.com.ar | NOERROR | - | ns1.wordpress.com, ns3.wordpress.com | 192.0.78.253, 192.0.78.172 |
| deguardia.ar | NOERROR | - | stephane.ns.cloudflare.com, brad.ns.cloudflare.com | 172.67.156.190, 104.21.8.34 |
| deguardia.app | NOERROR | - | dns2.registrar-servers.com, dns1.registrar-servers.com | 192.64.119.6 |
| laguardia.com | NOERROR | - | ns3.dreamhost.com, ns2.dreamhost.com | 173.236.246.112 |
| laguardia.com.ar | NOERROR | - | ns-955.awsdns-55.net, ns-1298.awsdns-34.org | 185.133.35.14, 185.133.35.13 |
| laguardia.ar | NXDOMAIN | NXDOMAIN | - | - |
| laguardia.app | NOERROR | - | fortaleza.ns.porkbun.com, salvador.ns.porkbun.com | - |

### Inferences
- **La tabla da "registrado" con alta confianza** (si está delegado, está registrado) y **"libre" con confianza media**. En .com/.app un NXDOMAIN casi siempre es un dominio libre, aunque puede haber dominios en *redemption/pending delete*, en *serverHold* o nombres premium/reservados del registro (Google Registry cobra precio premium a algunos .app), y eso no se puede ver sin RDAP o un registrar.
- **En .com.ar/.ar el NXDOMAIN es más débil:** NIC.ar permite registrar un dominio y delegarlo después, así que puede haber dominios registrados sin delegar. Ejemplos llamativos de palabras comunes sin delegar: cadete.com.ar, presente.com.ar, recado.com.ar, mostrador.com.ar, abierto.com.ar. Hay que confirmarlos uno por uno en nic.ar antes de decidir. No se pudo comprobar en esta sesión.
- **Ninguna semilla tiene el .com pelado disponible para registrar a mano.** La salida en .com es comprar el pelado si está a la venta (ver sección 2) o usar un prefijo/sufijo: getNAME/NAMEapp/holaNAME/miNAME.
- **Combinaciones con más TLD libres a la vez:** encargado (.ar + .app + getencargado.com + encargadoapp.*), cadete (.com.ar + .ar + .app + getcadete.com + cadeteapp.*), avisa (.com.ar + .ar + .app + avisaapp.*), presente (.com.ar + .app + getpresente.com + mipresente.*) y deturno (.com.ar + getdeturno.com + deturnoapp.* + estadeturno.*).

### Gaps
- No hay confirmación por RDAP/whois de ningún dominio: todas las rutas estaban bloqueadas. Conviene repetir la tabla con los RDAP pedidos desde una red sin restricciones, en particular los "libre?" de .com.ar/.ar de la shortlist.
- No se sabe si algún "libre?" en .app es premium o reservado en Google Registry.
- No se pudo ver el estado EPP (clientHold, redemptionPeriod, pendingDelete) de los dominios vencidos o en recuperación: siempreabierto.com, elrecado.com, holatimbre.com.

## 2. ¿Qué hay en los dominios registrados (parking, en venta, negocio activo)?

### Takeaway
No se pudo abrir ningún sitio ni ningún marketplace, así que **no hay precios** y el contenido no se verificó. Los NS sí permiten clasificar varios .com pelados de la shortlist como **en venta o parqueados**: mostrador.com y deturno.com en Afternic, presente.com en NameFind (GoDaddy) y encargado.com en parking de Above. En cambio recado.com y avisa.com comparten NS (giantpanda.com) e IP, lo que sugiere un mismo dueño, probablemente un portafolio.

### Cited Findings
- **NS de Afternic** (ns1–4.afternic.com; las IP 13.248.169.48 / 76.223.54.146 se repiten): mostrador.com, deturno.com, elcadete.com, siemprepresente.com, mifaro.com, alo.app, aloalo.com, sinesperas.com, guardia.com y miguardia.com. — (barrido propio, Apéndice A.3)
- **NS de NameFind** (ns1/ns2.namefind.com) con las mismas IP 13.248.169.48 / 76.223.54.146: presente.com. — (barrido propio)
- **Otros marketplaces y parking según los NS:**
  - Efty: mostra.com.
  - Atom/Squadhelp: aloapp.com y faroapp.com.
  - Aftermarket.com: tilde.app.
  - Sedo parking: lacampana.com y miturno.com.
  - ParkingCrew: elmostrador.com y avisame.com.
  - Above: encargado.com, elsereno.com y estamosabiertos.com.
  - NameBright (nsg1/nsg2.namebrightdns.com): gettilde.com, mitimbre.com, elportero.com, mostrame.com y tuturno.com.
  - Hostinger dns-parking: tusereno.com, elencargado.com, guardia.com.ar, guardia.ar y holaturno.app.
  - (barrido propio)
- **Dominios con NS de vencimiento o recuperación:** siempreabierto.com (expire1/2.gname-dns.com), elrecado.com (NS1/NS2.DOMAINRECOVER.com) y holatimbre.com (ns1/ns2.renewyourname.net). — (barrido propio)
- **Mismo operador probable:**
  - recado.com, avisa.com y respondeme.com usan damao/yangguang.ns.giantpanda.com y resuelven a las mismas IP de Linode (66.175.209.179 / 45.79.167.180).
  - sereno.com.ar y presente.ar comparten dns1–4.p03.nsone.net y las mismas IP (18.208.88.157 / 98.84.224.111).
  - tilde.ar, mostra.com.ar, elfaro.com.ar y laguardia.com.ar resuelven a 185.133.35.13/14.
  - (barrido propio)
- **Infraestructura activa o configurada** (Cloudflare, Vercel, AWS, Azure, hosting propio): por ejemplo tilde.com (Azure DNS), mostrador.ar (Vercel), deturno.ar y deturno.app (Cloudflare), elencargado.com.ar y elencargado.app (Vercel), atento.com.ar (NS propios dns1/dns2.atento.com.ar), sereno.com (AWS) y contesta.com (GoDaddy DNS, A 23.185.0.1). — (barrido propio)
- **Búsquedas de páginas de venta** de deturno.com, mostrador.com y presente.com en Afternic/Sedo/Dan: el buscador no encontró ningún listado indexado de esos nombres exactos. Solo aparecieron nombres parecidos en BrandBucket, como presentaire.com a USD 2.515. — [búsqueda web, BrandBucket presentaire](https://www.brandbucket.com/names/presentaire)
- **Contenido de los sitios:** las búsquedas no devolvieron páginas propias de recado.app, sereno.app, deturno.ar ni mostrador.ar. Lo único relacionado fue "De Turno Bar" en Capilla del Monte, que no tiene que ver con el dominio. — [Trip.com, De Turno Bar](https://uk.trip.com/travel-guide/foods/Capilla%20del%20Monte-56270-restaurant/De%20Turno%20Bar-43526400)

### Inferences
- **Tener los NS de Afternic** (ns1/ns2.afternic.com) suele significar que el dominio está listado para venta con transferencia rápida en Afternic/GoDaddy. Las IP 13.248.169.48 / 76.223.54.146 son las de las páginas de venta de GoDaddy/Afternic. Por eso **mostrador.com y deturno.com probablemente se puedan comprar**, a un precio desconocido. Es una inferencia por NS y no se vio la página.
- **NameFind es la cartera de dominios de GoDaddy**, así que presente.com probablemente esté en venta en GoDaddy/Afternic, posiblemente a precio "premium" por ser una palabra de diccionario. Inferencia.
- **El patrón nsg1/nsg2.namebrightdns.com es típico del inventario de HugeDomains**, que suele vender a precio fijo. Inferencia sin verificar.
- **Los dominios con NS de vencimiento** (siempreabierto.com, elrecado.com, holatimbre.com) podrían liberarse en semanas. Habría que monitorearlos si alguno interesa.
- **Que recado.com, avisa.com y respondeme.com compartan NS e IP** sugiere un portafolio de palabras en español de un mismo inversor. Comprarlos implicaría negociar con un domainer.
- **Delegación activa en Vercel o Cloudflare** (mostrador.ar, deturno.ar, deturno.app, elencargado.*) indica que **alguien está desplegando algo**. Antes de elegir esas semillas conviene revisar a mano qué hay en esos sitios, porque podría ser un producto en construcción.

### Gaps
- **Precios de venta:** no se vieron (Afternic, Sedo, Dan, Efty, Atom y GoDaddy estaban bloqueados).
- **Contenido real de cada sitio activo:** sin verificar. tilde.com, sereno.com, atento.com, contesta.com, portero.com, vigia.com, faro.com y alo.com resuelven a IP de hosting, pero no se pudo abrirlos.

## 3. ¿Hay un producto de software, chat o atención al cliente con ese nombre (en cualquier país)?

### Takeaway
Hay **conflictos directos en el mismo rubro** (chat o atención al cliente) para **Tilde** (chatbots de Tilde, Letonia), **Atento** (BPO de atención con centros en Argentina), **Atendido** (Atendio, chatbot de IA para pymes en México), **Respondé** (RespondeIA, IA para WhatsApp con MercadoPago) y **Aló** (AloTech, contact center con chatbot). **Turno** está saturado de apps de turnos. No apareció ningún producto de software con el nombre exacto **Recado, Deturno, Encargado, Cadete, Presente, Mostrador, Contesta, Avisa ni Sereno**.

### Cited Findings
| Semilla | Producto o uso existente encontrado | Rubro | Fuente |
|---|---|---|---|
| Tilde | Tilde (Riga, desde 1991) hace chatbots con LLM para atención al cliente, foco en idiomas europeos/bálticos; Capterra lo ubica en "conversational AI" (Letonia), desde €12.000 | **Mismo rubro (chat de atención)** | [Capterra](https://www.capterra.com/p/196919/Tilde-AI/reviews/); [tilde.ai/about](https://tilde.ai/about/); [Nimdzi](https://www.nimdzi.com/language-technology-radar/tilde/) |
| Atento | Atento: CRM/BPO de atención al cliente, soporte y cobranzas, uno de los 5 mayores del mundo, con contact centers en Argentina (Buenos Aires) | **Mismo rubro (atención al cliente)** | [Wikipedia](https://en.wikipedia.org/wiki/Atento); [Atento PR](https://atento.com/wp-content/uploads/2020/11/PR_-Atento-is-the-clear-leader-in-Latin-America-1.pdf); [Craft](https://craft.co/atento) |
| Atendido | "Atendio": IA conversacional para WhatsApp, Instagram, Facebook y TikTok, turnos y leads, para clínicas, salones, restaurantes, etc.; México, desde MX$1.990 | **Mismo rubro y nombre casi idéntico** | [Capterra Atendio](https://www.capterra.com/p/10042909/Atendio/) |
| Respondé | "RespondeIA": SaaS que automatiza la atención por WhatsApp con IA, carga servicios/horarios/precios del negocio, deriva a humanos, cobros con MercadoPago; dice tener más de 2.400 negocios (dato propio). También respond.io (más de 10.000 marcas B2C) | **Mismo rubro** | [RespondeIA docs](https://www.mintlify.com/RespondeIA-APP/front/introduction); [respond.io](https://respond.io/es/faqs/where-does-respondio-fit-company-tech-stack.md) |
| Aló | AloTech: suite de contact center con web chat, chatbot de autoservicio e integración con WhatsApp (G2, fundada en 2007); también la app de consumo "Alo Chat" | **Mismo rubro** | [G2 AloTech](https://www.g2.com/sellers/alotech); [SoftwareOne AloTech chatbot](https://platform.softwareone.com/product/alotech-chatbot/PCP-3312-3310) |
| Turno | Turnito (startup argentina de turnos para pymes), MrTurno (salud), Turni.to (Crowder, disponible en AR), SoloTurnos, TurnosYa (UTN) | Agenda de turnos, muy cercano | [iProUP Turnito](https://www.iproup.com/startups/63662-argentinos-crean-app-gratuita-para-que-pymes-y-comercios-no-pierdan-clientes); [UNCuyo MrTurno](https://www.uncuyo.edu.ar/prensa/upload/2022-12-01-onepager-mrturno.pdf); [Capterra Turni.to](https://www.capterra.es/software/206883/turni-to) |
| Faro | FARO Technologies (software de medición 3D, varias marcas en EE.UU., FARO INSIGHT pedida en 2026); FaroVerse Inc. tiene marcas FARO para software (2022) | Software (clase 9) | [Justia FARO Tech](https://trademark.justia.com/owners/faro-technologies-inc-2517005); [Justia FaroVerse](https://trademark.justia.com/owners/faroverse-inc-5343616) |
| Timbre | Timbre (app de música en vivo, Boston, USD 360K seed); "Timbre" (red social en App Store, Timbre Ltd. Group, con mensajería); Timbre Media (India, radio corporativa) | Apps de consumo | [TechCrunch](https://techcrunch.com/?p=752979); [App Store Timbre](https://apps.apple.com/app/timbre/id6755542884) |
| Vigía | MPS Vigía S.A. de C.V. (México, software con IA predictiva, nombre comercial VIGIA); Vigia AG (Suiza, software para cultivos); Quick Vigia+ y VIGIAH (monitoreo de seguridad) | Software / seguridad | [DunsGuide](https://www.dunsguide.com/company/51acc9251263d7472618367b75699671/mps-vigia-sa-de-cv); [G2 Vigia AG](https://www.g2.com/sellers/vigia-ag); [App Store VIGIAH](https://apps.apple.com/mx/app/vigiah/id6748910331) |
| Guardia | GuardiAR (plataforma argentina de cobertura de guardias médicas, autodeclarada); apps de seguridad municipales | Salud / seguridad | [LinkedIn](https://ar.linkedin.com/in/jviglianco) |
| Campana | Campana Systems (Waterloo, software para clubes de autos, Serie B de USD 40M en 2018); MiCampana.com (SaaS de marketing con IA, México, adquirida) | Software B2B | [CB Insights Campana](https://www.cbinsights.com/investor/campana-systems); [CB Insights MiCampana](https://www.cbinsights.com/company/micampanacom) |
| Mostra | Mostrarium (Mataró, CMS de apps); no se encontró "Mostra" exacto | Software (nombre parecido) | [Gust](https://gust.com/companies/mostrarium/financials) |
| Sereno | No hay software "Sereno". Parecidos: Sereneo (Francia, chatbot/callbot de atención, plataforma Djiin), SerenioBot (Perú, salud mental), Serno (app de personas IA) | Parecidos fonéticos; **Sereneo es del mismo rubro** | [Telecom Paris, Sereneo](https://nordf.telecom-paris.fr/en/partenaires/sereneo-3/); [Stork Serno](https://www.stork.ai/tools/serno) |
| Recado | No hay chatbot "Recado". "Vivo Recado" es el servicio de buzón de voz de la operadora Vivo (Brasil); "Recados" es una función de mensajería interna del CRM XT de Senior (Brasil) | Telecom/CRM en Brasil (palabra portuguesa) | [Vivo](https://vivo.com.br/para-voce/produtos-e-servicos/para-o-celular/pre-pago/vivo-pre/apps-inclusos); [Senior](https://documentacao.senior.com.br/crm-xt/manual-do-usuario/colaborativo/crm-x-monoempresa/colaborativo/recados/) |
| Avisa | No hay producto "Avisa" de chat. AviSAS (avisos de turnos del Servicio Andaluz de Salud), AVISApp (asociación de informática sanitaria de Valencia), "Avisa" (Massachusetts, equipos de comunicación de emergencia) | Notificaciones en salud pública (España) | [SSPA Andalucía](https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/ayudadigital/print/pdf/node/690); [App Store AVISApp](https://apps.apple.com/co/app/avisapp/id1483377712); [ZoomInfo](https://www.zoominfo.com/c/avisa/468849556) |
| Portero | No hay software "Portero". Portería Virtual (Chile, app de portería/videoportero); "Porter" (chatbot SMS municipal en EE.UU.) | Control de acceso de edificios | [App Store CL](https://apps.apple.com/cl/app/porteria-virtual/id1325636351); [Berkeley iSchool](https://www.ischool.berkeley.edu/node/13862) |
| Encargado | No hay software "Encargado". En AR, "encargado" es el de edificio; el rubro de consorcios tiene CONSO, HomeApp, Unitify, Consorcios en Red, ConsorcioAbierto | Ninguno con ese nombre | [Software Advice CONSO](https://www.softwareadvice.co.uk/software/563529/CONSO); [App Store ConsorcioAbierto](https://apps.apple.com/ar/app/consorcioabierto/id1361121401) |
| Abierto | No hay producto "Abierto" de chat ("código abierto" mete mucho ruido en la búsqueda); existe ConsorcioAbierto (AR, consorcios) | Ninguno exacto | [App Store ConsorcioAbierto](https://apps.apple.com/ar/app/consorcioabierto/id1361121401) |
| Cadete | No hay software "Cadete"; en AR "cadete" es el mensajero o repartidor (Glovo/Rappi) | Ninguno; connotación de delivery | [Cronista](https://www.cronista.com/entreprenerds/Como-funciona-la-startup-millonaria-que-te-hace-los-tramites-y-te-trae-cualquier-cosa-20180302-0002.html) |
| Presente | No hay app "Presente" (ni de asistencia ni de chat) | Ninguno | búsqueda web: solo herramientas genéricas de asistencia, p. ej. [Jibble](https://www.jibble.io/es/sistema-gestion-asistencia-estudiantil) |
| Deturno | No hay app, software ni chatbot "deturno"; solo "De Turno Bar" (Capilla del Monte) | Ninguno | [Trip.com](https://uk.trip.com/travel-guide/foods/Capilla%20del%20Monte-56270-restaurant/De%20Turno%20Bar-43526400) |
| Mostrador | No hay software "Mostrador" en AR; los resultados son puntos de venta genéricos | Ninguno | [YoFacturo (resultado genérico)](https://yo-facturo.com/punto-de-venta/) |
| Contesta | No hay app, chatbot ni software "Contesta" | Ninguno | [directorio Capterra (sin coincidencias)](https://www.capterra.es/directory/32448/chatbot/software) |

### Inferences
- **Mismo rubro y mismo mercado** (chat o atención para pymes en español): Atendido↔Atendio, Respondé↔RespondeIA y Atento↔Atento. Son conflictos fuertes de confusión y conviene **descartar** esas semillas.
- **Tilde y Aló** chocan con productos de chat o contact center que tienen presencia internacional. **Sereno** queda a una letra de Sereneo, que hace chatbots/callbots de atención en Francia. Es un riesgo menor pero real si se sale a Europa.
- **"Recado" en portugués** es la palabra de Vivo para el buzón de voz (servicio de telecomunicaciones, cercano a la clase 38). El riesgo existe solo si se expande a Brasil.
- **"Cadete" y "Turno"** tienen connotaciones fuertes en Argentina: delivery y agenda de turnos. Cadete no choca con ninguna marca encontrada, pero puede confundir sobre qué hace el producto.

### Gaps
- No se buscó en App Store/Google Play directamente porque WebFetch estaba bloqueado. El buscador puede no indexar apps chicas o nuevas, así que la ausencia de resultados no prueba que no existan.
- **Siempre:** no se hizo una búsqueda específica de producto (se descartó por ser genérica y tener todos los TLD pelados tomados).
- **El Mostrador** (medio chileno) aparece como asociación obvia de "mostrador", pero no se verificó en esta sesión.

## 4. ¿Hay conflictos marcarios evidentes en INPI (Argentina), WIPO o USPTO, clases 9, 35, 38 y 42?

### Takeaway
**No se pudo consultar INPI, WIPO Global Brand Database ni USPTO**: los tres están bloqueados por el proxy. Lo que sigue sale de agregadores indexados (Justia, TrademarkElite, CIPO) vía buscador y **no sirve como búsqueda de anterioridades**. Con eso se ven riesgos claros para **Faro** (FARO Technologies y FaroVerse en la clase 9) y uno a revisar para **Sereno** (USPTO SERENO 85478479, clase 9, estado desconocido; SERENAI en el Reino Unido, clases 9/35/42). Para el resto no aparecieron marcas, lo que **no significa que no existan**.

### Cited Findings
- **INPI** (portaltramites.inpi.gob.ar), **WIPO** (branddb.wipo.int, www.wipo.int) y **USPTO** (tmsearch.uspto.gov, tsdr.uspto.gov) devolvieron 403/EGRESS_BLOCKED. — (pruebas propias, Apéndice A.1)
- **FARO:** FARO Technologies tiene marcas de software en EE.UU. (CAM2, SOFTCHECK, JOBWALK, HOLOBUILDER, FARO FLATNESS CHECK) y pidió dos FARO INSIGHT en julio de 2026 para software descargable 3D. FaroVerse, Inc. tiene FARO y FAROVERSE (noviembre de 2022) para software de gestión de plataformas. — [Justia FARO Technologies](https://trademark.justia.com/owners/faro-technologies-inc-2517005); [TrademarkElite FARO INSIGHT](https://www.trademarkelite.com/trademark/trademark-detail/99944244/FARO-INSIGHT); [Justia FaroVerse](https://trademark.justia.com/owners/faroverse-inc-5343616)
- **SERENO:** Justia muestra la marca SERENO (serie 85478479) en la clase 9, con una lista de aparatos que incluye computadoras y equipos de procesamiento de datos. El fragmento no muestra estado ni titular. En el Reino Unido, SERENAI (presentada el 7/3/2026) cubre las clases 9, 35 y 42 (software). — [Justia SERENO](https://trademark.justia.com/854/78/sereno-85478479.html); [UK IPO Trade Mark Journal](https://www.ipo.gov.uk/t-tmj/tm-journals/2026-021/UK00004350785.html)
- **AVISA:** hubo una solicitud canadiense de Teknion Furniture Systems (Toronto, 23/12/1997) que figura como "dead" o "interruption of proceeding" (2000), sin productos visibles. AVASIS (Canadá, 2016) cubre software de gestión de obras. — [TrademarkElite AVISA](https://www.trademarkelite.com/canada/trademark/trademark-detail/865102/AVISA); [CIPO AVASIS](https://ised-isde.canada.ca/cipo/trademark-search/1736861)
- **CADETE:** en Justia solo aparecen marcas "CADET/CADETS" en EE.UU., de rubros ajenos (armas en la clase 13, abandonada; asociaciones juveniles; educación en la clase 41). Ninguna "CADETE" en software. — [Justia CADET](https://trademark.justia.com/787/88/cadet-78788947.html); [Justia MPT C.A.D.E.T.](https://trademarks.justia.com/871/54/mpt-c-a-d-e-87154236.html)
- **RECADO, ENCARGADO, CONTESTA:** sin resultados en Justia. **PRESENTE, MOSTRADOR, ENCARGADO:** sin registros de INPI en la clase 42 indexados; solo aparecieron registros chilenos de INAPI no relacionados. — búsqueda en Justia: solo devolvió marcas CADET, p. ej. [CADET 78788947](https://trademark.justia.com/787/88/cadet-78788947.html); [PortalChile INAPI (no relacionado)](https://www.portalchile.org/detalle-marca/42x-1563341)
- **TILDE:** no se encontró una marca de la UE ni de Letonia indexada para "TILDE" de SIA Tilde, aunque el producto sí existe (ver sección 3). — [búsqueda web, Nimdzi](https://www.nimdzi.com/language-technology-radar/tilde/)
- **Alcance de las clases:** la 42 cubre SaaS y software no descargable y la 9 el software descargable. Para una marca de software conviene buscar en ambas. — [Patron Accounting](https://www.patronaccounting.com/blog/trademark-for-software-and-apps-class-9-and-42); [Trama TM](https://www.tramatm.com/es/class-assist/trademark-class/42)
- **INPI:** los trámites ante el INPI son electrónicos. — [Boletín Oficial](https://www.boletinoficial.gob.ar/pdf/aviso/primera/219370/20191022)

### Inferences
- **Las palabras comunes del español** (recado, presente, mostrador, encargado, cadete, avisa, contesta) suelen estar registradas en Argentina como parte de marcas mixtas de rubros diversos, y algunas pueden considerarse descriptivas para un servicio de atención ("contesta", "atendido", "avisa"). Eso las hace **más débiles como marca** aunque no aparezcan anterioridades. "Deturno" (compuesto) y "Encargado"/"Cadete"/"Recado" (metáforas de un rol, no descripciones directas de la función) parecen **más distintivas** para un chatbot.
- **Atento** probablemente tenga marcas registradas en Argentina en las clases 35/38 por su operación local. No se verificó, pero el riesgo es alto igual.

### Gaps
- Falta la búsqueda real de anterioridades en **INPI** (portaltramites.inpi.gob.ar → Marcas → Búsqueda fonética/denominativa) para las 8 de la shortlist en las clases 9, 35, 38 y 42.
- Falta **WIPO Global Brand Database** (filtro de designaciones AR/BR/ES/US/EM) y **USPTO** (tmsearch) para las 8 de la shortlist.
- Los estados de SERENO (85478479) y SERENAI no están verificados.

## 5. Shortlist: las 8 semillas con el camino más limpio (dominio + sin conflicto fuerte)

### Takeaway
Las 8 semillas con el camino más limpio, en orden: **Deturno, Encargado, Presente, Recado, Cadete, Avisa, Mostrador y Contesta**. Ninguna mostró un producto de chat o atención con el mismo nombre. Todas tienen al menos un .com usable (getNAME/NAMEapp/holaNAME) y al menos un TLD argentino o .app sin delegar. Quedan como suplentes **Portero, Abierto y Sereno**. Quedan **descartadas** Tilde, Atento, Atendido, Respondé, Aló, Faro, Turno, Timbre, Vigía, Guardia, Siempre, Mostra y Campana.

### Cited Findings
| # | Semilla | Mejor ruta de dominio (estado DNS al 2026-10-08) | .com pelado | Conflictos encontrados | Riesgo |
|---|---|---|---|---|---|
| 1 | **Deturno** | deturno.com.ar libre?; getdeturno.com, deturnoapp.com, holadeturno.com, mideturno.com, estadeturno.com libres; deturnoapp.app libre | En venta probable (NS Afternic) | Ninguno de software; "De Turno Bar" (gastronomía) | Bajo. deturno.ar y deturno.app ya están delegados en Cloudflare: revisar qué hay |
| 2 | **Encargado** | **encargado.ar y encargado.app libres?**; getencargado.com, encargadoapp.com, holaencargado.com libres | Parking Above (posible compra) | Ninguno; rubro consorcios con otros nombres | Bajo. encargado.com.ar está tomado (Cloudflare, sin A) |
| 3 | **Presente** | **presente.app y presente.com.ar libres?**; getpresente.com, mipresente.com libres | NameFind (cartera de GoDaddy, probable venta premium) | Ninguno | Bajo-medio. presente.ar está tomado (mismo operador que sereno.com.ar); palabra común |
| 4 | **Recado** | **recado.com.ar y recado.ar libres?**; holarecado (4 TLD) y getrecado.com libres | Tomado (NS giantpanda, posible portafolio) | Vivo Recado (buzón de voz, Brasil) | Bajo en AR, medio si se va a Brasil. recado.app está tomado (sin A) |
| 5 | **Cadete** | **cadete.com.ar, cadete.ar y cadete.app libres?**; getcadete.com, cadeteapp.com, micadete.com libres | Registrado (NS no responde) | Ninguno de software; en AR "cadete" se asocia con delivery | Bajo marcario, medio semántico |
| 6 | **Avisa** | **avisa.com.ar, avisa.ar y avisa.app libres?**; avisaapp.com y holaavisa.com libres | Tomado (NS giantpanda, mismo operador que recado.com) | AviSAS y AVISApp (salud, España); AVISA en Canadá (muerta, 1997) | Bajo-medio. getavisa.com está tomado; "avisa" es en parte descriptivo |
| 7 | **Mostrador** | **mostrador.com.ar libre?**; getmostrador.com, mostradorapp.com, holamostrador.com libres | En venta probable (NS Afternic) | Ninguno de software (posible confusión con El Mostrador, Chile, sin verificar) | Bajo-medio. mostrador.ar está en Vercel (alguien despliega) y mostrador.app está tomado |
| 8 | **Contesta** | **contesta.com.ar y contesta.ar libres?**; contestaapp.com y holacontesta.com libres | Tomado (GoDaddy DNS, A activa) | Ninguno | Medio. getcontesta.com y contesta.app están tomados; descriptivo |
| supl. | Portero | portero.ar libre?; getportero.com, holaportero.com libres | Activo (DNSMadeEasy) | Portería Virtual (Chile); connotación de portero eléctrico | Medio |
| supl. | Abierto | abierto.com.ar y abierto.ar libres?; getabierto.com, abiertoapp.com libres | Tomado | Ruido con "código abierto"; ConsorcioAbierto | Medio |
| supl. | Sereno | sereno.ar libre?; holasereno (4 TLD) libre | Activo (AWS) | Sereneo (chatbots, Francia); SERENO USPTO clase 9 (estado ?); SERENAI UK 9/35/42 | Medio |

Fuentes de la tabla: barrido DNS propio (Apéndice A.3) y fuentes citadas en las secciones 3 y 4.

### Inferences
- **Mejor equilibrio entre identidad y dominio:** **Deturno** (nombre inventado, distintivo, sin choques, varios .com alternativos y probablemente se pueda comprar el pelado) y **Encargado** (el .ar y el .app pelados aparentan estar libres, que es raro para una palabra común). **Presente** y **Cadete** también tienen el .app pelado aparentemente libre.
- **Antes de enamorarse de un nombre:**
  1. Confirmar en nic.ar los "libre?" de .com.ar/.ar.
  2. Pedir precio de deturno.com, mostrador.com, presente.com y encargado.com.
  3. Hacer la búsqueda de anterioridades en INPI en las clases 9/35/38/42.
  4. Abrir a mano deturno.ar/.app, mostrador.ar y elencargado.* (Vercel/Cloudflare), que pueden ser productos en construcción.
- **Los descartes no son por dominio sino por conflicto:** Atendido (Atendio), Respondé (RespondeIA), Atento (BPO), Tilde (chatbots en Letonia) y Aló (AloTech) chocan en el mismo rubro. Turno, Faro, Timbre, Guardia y Vigía tienen además todos los TLD pelados tomados y nombres saturados.

### Gaps
- La shortlist depende de verificaciones que no se pudieron hacer acá: RDAP/whois real, precios de reventa y búsqueda en INPI/WIPO/USPTO. Si alguno de los "libre?" de .com.ar/.ar resulta registrado sin delegar, Recado, Avisa, Contesta y Mostrador pierden la mayor parte de su ventaja.
- No se evaluó la pronunciación, la memorabilidad ni el ajuste al posicionamiento (docs/posicionamiento.md). Esta nota cubre solo disponibilidad y conflictos.

