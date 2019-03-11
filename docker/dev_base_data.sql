

-- $ pg_dump -U postgres --data-only --column-inserts wishifieds

--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, icon, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Conditions" (id, name, icon, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Images" (id, reftoken, origurl, url, "position", listing_id, user_id, created_at, updated_at) FROM stdin;
1 tbd ref https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_570xN.1773086461_9oon.jpg https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_570xN.1773086461_9oon.jpg 0 1 1 2019-03-07 23:38:49.955+00  2019-03-07 23:38:49.955+00
2 tbd ref https://i.etsystatic.com/17346189/d/il/955509/1765125719/il_340x270.1765125719_tmic.jpg?version=0 https://i.etsystatic.com/17346189/d/il/955509/1765125719/il_340x270.1765125719_tmic.jpg?version=0 1 1 1 2019-03-07 23:38:49.955+00  2019-03-07 23:38:49.955+00
3 tbd ref https://i.etsystatic.com/17346189/d/il/527659/1766807269/il_340x270.1766807269_9z3z.jpg?version=0 https://i.etsystatic.com/17346189/d/il/527659/1766807269/il_340x270.1766807269_9z3z.jpg?version=0 2 1 1 2019-03-07 23:38:49.955+00  2019-03-07 23:38:49.955+00
4 tbd ref https://i.etsystatic.com/17163470/d/il/f1df99/1823579857/il_340x270.1823579857_7lrk.jpg?version=0 https://i.etsystatic.com/17163470/d/il/f1df99/1823579857/il_340x270.1823579857_7lrk.jpg?version=0 0 2 1 2019-03-07 23:47:14.906+00  2019-03-07 23:47:14.906+00
5 tbd ref https://i.etsystatic.com/17163470/r/il/e0fc90/1846728861/il_794xN.1846728861_95f8.jpg https://i.etsystatic.com/17163470/r/il/e0fc90/1846728861/il_794xN.1846728861_95f8.jpg 1 2 1 2019-03-07 23:47:14.906+00  2019-03-07 23:47:14.906+00
6 tbd ref https://i.etsystatic.com/10167223/d/il/c370dd/933572611/il_75x75.933572611_cuhj.jpg?version=0 https://i.etsystatic.com/10167223/d/il/c370dd/933572611/il_75x75.933572611_cuhj.jpg?version=0 0 3 2 2019-03-07 23:57:43.99+00 2019-03-07 23:57:43.99+00
7 tbd ref https://i.etsystatic.com/10167223/r/il/c370dd/933572611/il_794xN.933572611_cuhj.jpg https://i.etsystatic.com/10167223/r/il/c370dd/933572611/il_794xN.933572611_cuhj.jpg 1 3 2 2019-03-07 23:57:43.99+00 2019-03-07 23:57:43.99+00
8 tbd ref https://i.etsystatic.com/10167223/d/il/e01ae5/1174692831/il_340x270.1174692831_p3zc.jpg?version=0 https://i.etsystatic.com/10167223/d/il/e01ae5/1174692831/il_340x270.1174692831_p3zc.jpg?version=0 2 3 2 2019-03-07 23:57:43.99+00 2019-03-07 23:57:43.99+00
9 tbd ref https://i.etsystatic.com/9164565/r/il/4d73c1/1745794125/il_794xN.1745794125_nwsk.jpg  https://i.etsystatic.com/9164565/r/il/4d73c1/1745794125/il_794xN.1745794125_nwsk.jpg  0 4 2 2019-03-08 00:06:12.691+00  2019-03-08 00:06:12.691+00
\.


--
-- Data for Name: Listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Listings" (id, category_id, condition_id, title, description, price, "linkUrl", keywords, images_ref, hero_img, location_id, user_id, slug, status, created_at, updated_at) FROM stdin;
1 11  6 Princess Shoes  Shoes that even a princess that would be proud to wear. 20  https://www.etsy.com/listing/655680492/princess-shoes?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=girls+princess+shoes&ref=sr_gallery-1-7  princess shoes  tbd https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_570xN.1773086461_9oon.jpg 1 1 tbd ACTIVE  2019-03-07 23:38:49.941+00  2019-03-07 23:38:49.941+00
2 11  7 Nike Princess Athletic Shoes  Nike athletic shoes with princess flair.  25  https://www.etsy.com/listing/687643957/nike-roshe-mickey-disney-custom-made?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=disney+nike&ref=sr_gallery-1-1&pro=1&frs=1&col=1 Princess Athletic Shoes, Nike Princess  tbd https://i.etsystatic.com/17163470/d/il/f1df99/1823579857/il_340x270.1823579857_7lrk.jpg?version=0 2 1 tbd ACTIVE  2019-03-07 23:47:14.895+00  2019-03-07 23:47:14.895+00
3 12  1 Belle's Book Emporium Looking for this book, which is really just an old version of Beauty & The Beast. Any condition, but better is preferable.  15   https://www.etsy.com/listing/270797917/belles-book-emporium-beauty-and-the?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=princess+vintage&ref=sc_gallery-1-3&plkey=c3872e5f59fdcaba6d1447ecc930685b31c230bb%3A270797917&bes=1 Belle, Book Emporium, Belle's Book Emporium, Beauty, Beast  tbd https://i.etsystatic.com/10167223/d/il/c370dd/933572611/il_75x75.933572611_cuhj.jpg?version=0 1 2 tbd ACTIVE  2019-03-07 23:57:43.979+00  2019-03-07 23:57:43.979+00
4 12  1 Princess Jewelry Holder Jewelry case fit for a princess.  30  https://www.etsy.com/listing/645394750/vintage-decorative-silverplated-ornate?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=princess+vintage+decorative&ref=sr_gallery-1-37&organic_search_click=1 princess, jewelry case  tbd https://i.etsystatic.com/9164565/r/il/4d73c1/1745794125/il_794xN.1745794125_nwsk.jpg  1 2 tbd ACTIVE  2019-03-08 00:06:12.678+00  2019-03-08 00:06:12.678+00
\.


--
-- Data for Name: Locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Locations" (id, name, description, address1, address2, city, state, postalcode, country, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Logs" (id, log_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Messages" (id, sender_id, recipient_id, listing_id, content, status, created_at, updated_at) FROM stdin;
1 2 1 2 I have one to sell! Girls outgrew before they could wear, so brand new. I would take $28. UNREAD2019-03-08 00:14:20.827+00  2019-03-08 00:14:20.827+00
2 2 1 2 Come to think of it, I would even take $27. UNREAD  2019-03-08 00:14:44.506+00  2019-03-08 00:14:44.506+00
3 1 2 4 I would totally trade you the shoes for this jewelry case.  UNREAD  2019-03-08 00:15:41.599+00  2019-03-08 00:15:41.599+00
4 1 2 4 I think you'd be quite happy. UNREAD  2019-03-08 00:16:10.799+00  2019-03-08 00:16:10.799+00
\.


--
-- Data for Name: Phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Phones" (id, countrycode, areacode, prefix, line, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20180427224641-create-table-log.js
20180427230650-create-table-user.js
20180725044011-create-listing.js
20180725050543-create-condition.js
20180725050610-create-category.js
20180725051435-create-location.js
20180725053920-create-image.js
20180725182306-create-phone.js
20181018043649-create-message.js
20181105050421-add_avatar_column_to_user_table.js
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, eat, email, password, prt, prtexpiration, role, username, phone_id, confirmed, status, termsconditions, created_at, updated_at, profile_pic_url) FROM stdin;
2 4783cf13e1e1a9449b857ca88907c3431c5470cf2b84e335  jen2@example.com  $2b$08$fnE6ZRbN0u0YMqntH25sYeuE/B2DY1tMeYUJvhuw/GJHE6y1me8iC  \N  \N  user  jen2  \N  $2b$08$I77wIdygNzg6HF4tIxe.dOGN1uh03V0pPCWf7TPYC/MoY4u.BVOkK  pending \N  2019-03-07 23:52:06.044+00  2019-03-07 23:52:06.116+00  /assets/profile_default.png
1 85e10ff56b2369e4f863a4fa45424c41af3867eefd95a1c5  jen@example.com $2b$08$QhfphVCCb8fYpYEebTAhW.je0bGVzX18W75jGCrSW/nhwqNRc1t9W  \N  \N  user  jen \N  $2b$08$HwKVwT5sw/pOJTHSJRavb.BZX8OmdrKtG0EdlZlwmgokBhEdgzb0G  pending \N  2019-03-07 23:33:09.918+00  2019-03-08 00:14:57.669+00  /assets/profile_default.png
\.


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 1, false);


--
-- Name: Conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Conditions_id_seq"', 1, false);


--
-- Name: Images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Images_id_seq"', 9, true);


--
-- Name: Listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Listings_id_seq"', 4, true);


--
-- Name: Locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Locations_id_seq"', 1, false);


--
-- Name: Logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Logs_id_seq"', 1, false);


--
-- Name: Messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Messages_id_seq"', 4, true);


--
-- Name: Phones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Phones_id_seq"', 1, false);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--
