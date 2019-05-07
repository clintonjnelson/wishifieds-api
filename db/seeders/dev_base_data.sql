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
SELECT pg_catalog.set_config('search_path', '', false);  -- search path order. Later add wishifieds.
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;



SET SEARCH_PATH to 'public';

--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "categories"(id, name, icon, created_at, updated_at)
VALUES
(1, 'any', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(2, 'antiques', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(3, 'art', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(4, 'atv & off-road', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(5, 'autoparts', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(6, 'autos', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(7, 'baby & kids', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(8, 'bicycles & parts', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(9, 'boats & watercraft', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(10, 'books & magazines', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(11, 'camera & video', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(12, 'clothing & assessories', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(13, 'collectibles', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(14, 'computers', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(15, 'electronics', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(16, 'farm & agriculture', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(17, 'furniture', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(18, 'games & toys', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(19, 'gigs', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(20, 'health & beauty', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(21, 'housewares', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(22, 'housing & apartments', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(23, 'jewelery', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(24, 'lawn & garden', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(25, 'materials', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(26, 'motorcycles & scooters', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(27, 'musical goods', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(28, 'other', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(29, 'real estate', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(30, 'rentals', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(31, 'services & consulting', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(32, 'sporting goods', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(33, 'tickets & events', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(34, 'tools & equipment', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(35, 'travel & accommodations', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00');



--
-- Data for Name: Conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "conditions"(id, name, icon, created_at, updated_at)
VALUES
(1, 'n/a', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(2, 'any', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(3, 'as-is', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(4, 'poor', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(5, 'fair', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(6, 'good', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(7, 'excellent', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(8, 'new', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00'),
(9, 'not applicable', null, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00');


--
-- Data for Name: Images; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "images" (id, origurl, url, "position", listing_id, user_id, created_at, updated_at, status)
VALUES
(10, 'https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_794xN.1773086461_9oon.jpg', 'https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_794xN.1773086461_9oon.jpg', 0, 5, 3, '2019-03-09 22:37:41.542+00', '2019-03-09 22:37:41.542+00', 'ACTIVE'),
(11, 'https://i.etsystatic.com/17346189/d/il/955509/1765125719/il_340x270.1765125719_tmic.jpg?version=0', 'https://i.etsystatic.com/17346189/d/il/955509/1765125719/il_340x270.1765125719_tmic.jpg?version=0', 1, 5, 3, '2019-03-09 22:37:41.542+00', '2019-03-09 22:37:41.542+00', 'ACTIVE'),
(12, 'https://i.etsystatic.com/15498919/c/2485/1973/229/10/il/784159/1676039173/il_340x270.1676039173_3cad.jpg', 'https://i.etsystatic.com/15498919/c/2485/1973/229/10/il/784159/1676039173/il_340x270.1676039173_3cad.jpg', 0, 6, 3, '2019-03-09 22:41:16.14+00', '2019-03-09 22:41:16.14+00', 'ACTIVE'),
(13, 'https://i.etsystatic.com/isla/a5c163/26194534/isla_75x75.26194534_dmko2dgx.jpg?version=0', 'https://i.etsystatic.com/isla/a5c163/26194534/isla_75x75.26194534_dmko2dgx.jpg?version=0', 1, 6, 3, '2019-03-09 22:41:16.14+00', '2019-03-09 22:41:16.14+00', 'ACTIVE'),
(14, 'https://i.etsystatic.com/18282007/r/il/56dff6/1723602048/il_794xN.1723602048_p61o.jpg', 'https://i.etsystatic.com/18282007/r/il/56dff6/1723602048/il_794xN.1723602048_p61o.jpg', 0, 7, 4, '2019-03-09 22:43:44.178+00', '2019-03-09 22:43:44.178+00', 'ACTIVE'),
(15, 'https://i.etsystatic.com/6079982/r/il/e83f03/661150582/il_794xN.661150582_i8bg.jpg', 'https://i.etsystatic.com/6079982/r/il/e83f03/661150582/il_794xN.661150582_i8bg.jpg', 0, 8, 4, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00', 'ACTIVE'),
(16, 'https://i.etsystatic.com/isla/63ba79/30987754/isla_75x75.30987754_pio7jca9.jpg?version=0', 'https://i.etsystatic.com/isla/63ba79/30987754/isla_75x75.30987754_pio7jca9.jpg?version=0', 1, 8, 4, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00', 'ACTIVE'),
(17, 'https://i.etsystatic.com/6079982/d/il/6d2b84/380594775/il_340x270.380594775_m516.jpg?version=0', 'https://i.etsystatic.com/6079982/d/il/6d2b84/380594775/il_340x270.380594775_m516.jpg?version=0', 2, 8, 4, '2019-03-09 22:45:33.05+00', '2019-03-09 22:45:33.05+00', 'ACTIVE');


--
-- Data for Name: Listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "listings" (id, category_id, condition_id, title, description, price, "linkUrl", keywords, hero_img, user_location_id, user_id, slug, status, created_at, updated_at)
VALUES
(5, 11, 7, 'Princess Shoes', 'Shoes even a princess would be happy to have.', '20', ' https://www.etsy.com/listing/655680492/princess-shoes?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=girls+princess+shoes&ref=sr_gallery-1-7', 'princess shoes, princess', 'https://i.etsystatic.com/17346189/r/il/42ead1/1773086461/il_794xN.1773086461_9oon.jpg', 1, 3, 'tbd', 'ACTIVE', '2019-03-09 22:37:41.527+00', '2019-03-09 22:37:41.527+00'),
(6, 12, 6, 'Princess Mirror', 'Mirror a princess would be happy to look into.', '22', ' https://www.etsy.com/listing/534350450/antique-baroque-mirror-rococo-antique?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=princess+mirror&ref=sr_gallery-1-11&organic_search_click=1&cns=1', 'princess mirror', 'https://i.etsystatic.com/15498919/c/2485/1973/229/10/il/784159/1676039173/il_340x270.1676039173_3cad.jpg', 1, 3, 'tbd', 'ACTIVE', '2019-03-09 22:41:16.129+00', '2019-03-09 22:41:16.129+00'),
(7, 12, 5, 'Princess Jewelry Box', 'A jewelry box that a princess would adore.', '40', ' https://www.etsy.com/listing/651256906/vintage-gold-filigree-jewelry-box?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=princess+jewelery+box&ref=sr_gallery-1-11&organic_search_click=1', 'princess jewelry box, princess', 'https://i.etsystatic.com/18282007/r/il/56dff6/1723602048/il_794xN.1723602048_p61o.jpg', 1, 4, 'tbd', 'ACTIVE', '2019-03-09 22:43:44.17+00', '2019-03-09 22:43:44.17+00'),
(8, 12, 7, 'Princess Tiara Display Case', 'A display case for my princess tiara', '25', ' https://www.etsy.com/listing/205408462/round-crown-tiara-display-case-with?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=princess+jewelery+box&ref=sr_gallery-1-7&organic_search_click=1&bes=1&col=1', 'princess tiara display, princess', 'https://i.etsystatic.com/6079982/r/il/e83f03/661150582/il_794xN.661150582_i8bg.jpg', 1, 4, 'tbd', 'ACTIVE', '2019-03-09 22:45:33.039+00', '2019-03-09 22:45:33.039+00');


--
-- Data for Name: Favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "favorites"(id, user_id, listing_id, status, created_at, updated_at)
VALUES
(1, 3, 7, 'ACTIVE', '2019-03-09 22:41:16.129+00', '2019-03-09 22:41:16.129+00'),
(2, 4, 5, 'ACTIVE', '2019-03-09 22:41:16.129+00', '2019-03-09 22:41:16.129+00');


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
-- SEE OTHER SCRIPT base_us_zipcode_locations.sql FOR THIS DATA
--


--
-- Data for Name: Logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "messages" (id, sender_id, recipient_id, listing_id, content, status, created_at, updated_at)
VALUES
(5, 4, 3, 5, 'I have one I could sell you! $22 though. Sound ok?', 'UNREAD', '2019-03-09 22:51:48.89+00', '2019-03-09 22:51:48.89+00'),
(6, 4, 3, 5, 'You would have to pay shipping or meet me nearby my house in Olympia.', 'UNREAD', '2019-03-09 22:52:23.106+00', '2019-03-09 22:52:23.106+00'),
(7, 4, 3, 6, 'I own that store and could sell for $27.', 'UNREAD', '2019-03-09 22:53:33.177+00', '2019-03-09 22:53:33.177+00'),
(8, 4, 3, 6, 'Oh, and free shipping.', 'UNREAD', '2019-03-09 22:53:40.911+00', '2019-03-09 22:53:40.911+00'),
(9, 3, 4, 7, 'I have one to sell you. My kids outgrew & I''m not the princess type.', 'UNREAD', '2019-03-09 22:55:17.814+00', '2019-03-09 22:55:17.814+00'),
(10, 3, 4, 7, 'It''s probably only worth $35, as maybe not in perfect condition anymore.', 'UNREAD', '2019-03-09 22:55:40.805+00', '2019-03-09 22:55:40.805+00'),
(11, 3, 4, 8, 'I have something similar to this that should work. I''d attach a picture, but the site creator doesn''t support that feature yet.', 'UNREAD', '2019-03-09 22:56:44.401+00', '2019-03-09 22:56:44.401+00'),
(12, 3, 4, 8, 'Sure would be nice to have in-line pictures in messages.', 'UNREAD', '2019-03-09 22:57:09.447+00', '2019-03-09 22:57:09.447+00'),
(13, 3, 4, 8, 'Like a "send picture" feature for message.', 'UNREAD', '2019-03-09 22:57:24.893+00', '2019-03-09 22:57:24.893+00');


--
-- Data for Name: Phones; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "users" (id, eat, email, password, prt, prtexpiration, role, username, phone_id, confirmed, status, termsconditions, created_at, updated_at, profile_pic_url)
VALUES
(4, '1da0e53d588c741ca179ca1444d3eaab8f62d1465abf42ba', 'jen2@example.com', '$2b$08$UzkW20d1Nw3xCl1C.gcNCu8Z1hmstkoLO/zyJTVsAz2tHd0z1Tnbe', NULL, NULL, 'USER', 'jen2', NULL, '$2b$08$ZADkSYLMtxsvHfqnjhgw4ePF3/9F0/.GQtAJYJ3M5NPjSTosoBGHi', 'PENDING', NULL, '2019-03-09 22:41:39.551+00', '2019-03-09 22:41:39.611+00', '/assets/profile_default.png'),
(3, '817f7ac260c654fdb75275d2986f3510905121318447f5f7', 'jen@example.com', '$2b$08$f6GVAxDVZOCyrDhkxCGmf.6g7vHVXgsUg/NGC0T1RBAg4lI2mF5wa', NULL, NULL, 'USER', 'jen', NULL, '$2b$08$owHPRgwk.pxhqPbo2WxHOOrF1yvEml7T.brksIrULfxeozWERT4km', 'PENDING', NULL, '2019-03-09 22:34:34.305+00', '2019-03-09 22:54:39.349+00', '/assets/profile_default.png');



--
-- Data for Name: users_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "users_locations"(id, user_id, location_id, description, is_default, created_at, updated_at)
VALUES
(1, 3, 38512, 'default', true, '2019-03-09 22:41:16.129+00', '2019-03-09 22:41:16.129+00'),
(2, 4, 38512, 'default', true, '2019-03-09 22:41:16.129+00', '2019-03-09 22:41:16.129+00');



--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('categories', 'id'), coalesce(MAX(id),0) + 1, false) from categories;


--
-- Name: Conditions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('conditions', 'id'), coalesce(MAX(id),0) + 1, false) from conditions;


--
-- Name: Images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('images', 'id'), coalesce(MAX(id),0) + 1, false) from images;


--
-- Name: Listings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('listings', 'id'), coalesce(MAX(id),0) + 1, false) from listings;


--
-- Name: Locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('locations', 'id'), coalesce(MAX(id),0) + 1, false) from locations;


--
-- Name: Logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('logs', 'id'), coalesce(MAX(id),0) + 1, false) from logs;


--
-- Name: Messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('messages', 'id'), coalesce(MAX(id),0) + 1, false) from messages;


--
-- Name: Phones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('phones', 'id'), coalesce(MAX(id),0) + 1, false) from phones;


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('users', 'id'), coalesce(MAX(id),0) + 1, false) from users;


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval(pg_get_serial_sequence('users_locations', 'id'), coalesce(MAX(id),0) + 1, false) from users_locations;


--
-- PostgreSQL database dump complete
--
