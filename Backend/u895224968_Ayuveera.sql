-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 31, 2026 at 10:18 AM
-- Server version: 11.8.9-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u895224968_Ayuveera`
--

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(254) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','resolved') NOT NULL DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_name` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` varchar(500) NOT NULL,
  `city` varchar(100) NOT NULL DEFAULT '',
  `pincode` varchar(12) NOT NULL,
  `payment_method` enum('COD','RAZORPAY') NOT NULL DEFAULT 'COD',
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `total_amount` int(10) UNSIGNED NOT NULL,
  `status` enum('pending_payment','placed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  UNIQUE KEY `uq_orders_razorpay_order_id` (`razorpay_order_id`),
  UNIQUE KEY `uq_orders_razorpay_payment_id` (`razorpay_payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `unit_price` int(10) UNSIGNED NOT NULL,
  `quantity` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `price` int(10) UNSIGNED NOT NULL,
  `old_price` int(10) UNSIGNED NOT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 0.0,
  `reviews` varchar(40) NOT NULL DEFAULT '',
  `image` varchar(1000) NOT NULL,
  `description` text NOT NULL,
  `tag` varchar(120) NOT NULL DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `brand` varchar(100) DEFAULT 'AYUVEERA',
  `short_description` varchar(500) DEFAULT NULL,
  `dosage_form` varchar(100) DEFAULT NULL,
  `pack_size` varchar(100) DEFAULT NULL,
  `key_benefits` text DEFAULT NULL,
  `ingredients` text DEFAULT NULL,
  `how_to_use` text DEFAULT NULL,
  `safety_information` text DEFAULT NULL,
  `storage_instructions` text DEFAULT NULL,
  `suitable_for` varchar(255) DEFAULT NULL,
  `product_type` varchar(150) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `country_of_origin` varchar(100) DEFAULT 'India',
  `shelf_life` varchar(100) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `license_number` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `slug`, `price`, `old_price`, `rating`, `reviews`, `image`, `description`, `tag`, `is_active`, `brand`, `short_description`, `dosage_form`, `pack_size`, `key_benefits`, `ingredients`, `how_to_use`, `safety_information`, `storage_instructions`, `suitable_for`, `product_type`, `manufacturer`, `country_of_origin`, `shelf_life`, `meta_title`, `meta_description`, `license_number`) VALUES
(16, 'Ayuveera Calm Plus Capsules', 'Stress Management', 'calm-plus-capsules', 899, 1499, 4.7, '0', 'uploads/products/1c2df29946efc1bcc12f5701dc7209c2.jpg', 'Support your daily mental wellness with AYUVEERA CALM PLUS Capsules.\r\n\r\nCrafted with traditional Ayurvedic herbs, CALM PLUS is formulated to support stress management, relaxation and healthy sleep as part of a balanced lifestyle.\r\n\r\nKey Benefits:\r\n\r\nHelps support stress management\r\n\r\nSupports relaxation and mental well-being\r\n\r\nHelps maintain healthy sleep quality\r\n\r\nSupports cognitive function\r\n\r\nKey Ingredients:\r\nAshwagandha, Brahmi, Mandukparni, Jatamansi, Khurasani Ajwain, Pippali and Shankhpushpi.\r\n\r\nProduct Details:\r\n\r\n30 Soft Gelatin Capsules\r\n\r\nAyurvedic Proprietary Medicine\r\n\r\nTraditional Ayurvedic Herbal Formulation\r\n\r\nUsage: Take as directed by a healthcare professional.', 'Stress & Sleep Support', 1, 'AYUVEERA', 'Calmplus Soft Gelatin Capsules with Calmihills Ghrita, formulated to support stress relief, relaxation and healthy sleep.', 'Soft Gelatin Capsules', '30 Capsules', '[\r\n        \"Natural support for stress relief\",\r\n        \"Helps improve sleep quality and relaxation\",\r\n        \"Helps improve mental and emotional well-being\",\r\n        \"Helps enhance cognitive function\"\r\n    ]', '[\r\n        \"Calmihills Ghrita\",\r\n        \"Ashwagandha\",\r\n        \"Brahmi\",\r\n        \"Mandukparnee\",\r\n        \"Jatamansi\",\r\n        \"Khurasani Ajwain\",\r\n        \"Pippali\",\r\n        \"Shankhpushpi\",\r\n        \"Cow Milk\",\r\n        \"Go-Ghruta\"\r\n    ]', 'Take 2 soft gel capsules daily in the morning or as recommended by the physician. Ideally take on an empty stomach before meals. For better results, take with warm water.', 'Use as directed by a qualified physician. Follow the dosage instructions on the product label.', 'Store in a cool and dry place. Keep away from direct sunlight and moisture.', 'Adults seeking support for stress management, relaxation and sleep quality', 'Ayurvedic Proprietary Medicine', NULL, 'India', NULL, 'Ayuveera Calm Plus Capsules | Stress & Sleep Support', 'Discover AYUVEERA Calm Plus Soft Gelatin Capsules with Calmihills Ghrita for stress relief, relaxation and sleep support.', NULL),
(17, 'Ayuveera Keshraj Hair Shampoo', 'Hair Care', 'hair-care', 499, 299, 4.7, '0', 'uploads/products/a2c849397f58257029ffcc5eb94037fe.jpg', 'AYUVEERA Keshraj Hair Shampoo is a herbal hair cleansing formulation made with traditional botanical ingredients. Designed to cleanse the scalp, support hair moisture balance and maintain healthier-looking hair.', 'Herbal Hair Care', 1, 'AYUVEERA', 'A herbal hair wash formulation with Amla, Shikakai, Aritha, Bhringraj, Neem and other botanical ingredients.', 'Hair Wash', '200 ml', '[\r\n        \"Supports intensive hair repair\",\r\n        \"Helps restore moisture balance\",\r\n        \"Soothes scalp irritation\",\r\n        \"Helps promote stronger and healthier-looking hair\"\r\n    ]', '[\r\n        \"Amla\",\r\n        \"Shikakai\",\r\n        \"Aritha\",\r\n        \"Bhringraj\",\r\n        \"Methi Seeds\",\r\n        \"Kalonji Seeds\",\r\n        \"Neem Leaves\",\r\n        \"Aloe Vera Pulp\",\r\n        \"Henna Leaves\",\r\n        \"Jaswant Leaves\",\r\n        \"Betel Leaves\",\r\n        \"Curry Leaves\",\r\n        \"Fragrance\",\r\n        \"SLS\"\r\n    ]', 'Take sufficient quantity, apply on scalp, work into a lather and wash. Repeat if required.', 'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs.', 'Store in a cool and dry place. Keep the bottle tightly closed.', 'Suitable for adults looking for herbal hair cleansing and scalp care.', 'Herbal Hair Care Product', NULL, 'India', NULL, 'AYUVEERA Keshraj Hair Shampoo 200ml | Herbal Hair Wash', 'Discover AYUVEERA Keshraj Hair Shampoo with Amla, Shikakai, Bhringraj, Neem and other botanical ingredients.', NULL),
(18, 'Ayuveera Keshraj Hair Oil', 'Hair Care', 'hair-care', 599, 399, 4.9, '0', 'uploads/products/b24c8c1e09480bd3414bb026fa43d845.jpg', 'AYUVEERA Keshraj Hair Oil is a botanical hair oil formulation made with coconut oil, henna, bhringraj, amla, brahmi and other traditional ingredients to support hair nourishment and conditioning.', 'Herbal Hair Care', 1, 'AYUVEERA', 'A nourishing herbal hair oil formulated with traditional botanical ingredients for hair care and scalp conditioning.', 'Hair Oil', '100 ml', '[\r\n        \"May help improve natural hair growth\",\r\n        \"Helps enhance shine and lustre\",\r\n        \"Helps prevent split ends\",\r\n        \"Calming and conditioning formula\"\r\n    ]', '[\r\n        \"Coconut Oil\",\r\n        \"Henna Leaf\",\r\n        \"Brahmi Leaf\",\r\n        \"Aloe Vera Leaf\",\r\n        \"Betel Leaf\",\r\n        \"Methi Seed Powder\",\r\n        \"Kalonji Seed Powder\",\r\n        \"Bhringraj Powder\",\r\n        \"Amla Powder\",\r\n        \"Jaswand Flower\",\r\n        \"Sarso Oil\",\r\n        \"Kapoor Oil\",\r\n        \"Almond Fragrance\"\r\n    ]', 'Gently massage the oil into the hair, ensuring the entire scalp is covered. Leave on for at least 20 minutes. Cleanse with herbal hair wash and warm water. May also be left overnight if desired.', 'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs.', 'Store in a cool and dry place, away from direct sunlight.', 'Suitable for adults seeking hair nourishment and conditioning.', 'Herbal Hair Oil', NULL, 'India', NULL, 'AYUVEERA Keshraj Hair Oil 100ml | Herbal Hair Oil', 'Explore AYUVEERA Keshraj Hair Oil with coconut oil, amla, bhringraj, brahmi and traditional botanical ingredients.', NULL),
(19, 'Ayuveera Pachan+ Tablets', 'Digestion Support', 'digestion-support', 1599, 1199, 4.8, '0', 'uploads/products/c4bfa60e2d09076008d1e0b9a7a9cb07.jpg', 'AYUVEERA PACHAN+ is an Ayurvedic proprietary tablet formulation made with traditional herbal ingredients to support digestion and gut function.', 'Herbal Digestion Support', 1, 'AYUVEERA', 'An Ayurvedic digestive formulation made with Ajma, Bilagharbha, Chitrak, Haritaki, Jeera, Shunthi and other traditional ingredients.', 'Coated Tablets', '60 Tablets', '[\r\n        \"Supports digestion\",\r\n        \"Helps relieve indigestion, gas and bloating\",\r\n        \"Supports gut function\",\r\n        \"Helps in nutrient absorption\"\r\n    ]', '[\r\n        \"Ajma Churna\",\r\n        \"Belgarga Ghana\",\r\n        \"Chitrak Ghana\",\r\n        \"Haritaki\",\r\n        \"Indrajav Churna\",\r\n        \"Jeera Churna\",\r\n        \"Kutaj Ghana\",\r\n        \"Shunthi Churna\",\r\n        \"Triphala Churna\",\r\n        \"Trikatu Kadha\",\r\n        \"Amalavetas Quath\"\r\n    ]', 'Take 1 tablet twice daily preferably after meals, or as recommended by the physician. For better results, take with warm water.', 'Use as directed by a qualified healthcare professional. Read the product label before use.', 'Store in a cool and dry place, away from direct sunlight and moisture.', 'Adults seeking support for digestion and gut function.', 'Ayurvedic Proprietary Medicine', NULL, 'India', NULL, 'AYUVEERA PACHAN+ Tablets 60 | Ayurvedic Digestion Support', 'Discover AYUVEERA PACHAN+ Ayurvedic Tablets formulated with traditional herbs to support digestion, gut function and nutrient absorption.', NULL),
(20, 'Ayuveera Tejas Face Cream', 'Skin Care', 'skin-care', 599, 349, 4.8, '0', 'uploads/products/6ad26153ccca18db0cce2278ce68190b.jpg', 'AYUVEERA TEJAS Face Cream is a skincare formulation made with traditional botanical ingredients to support skin hydration, improve the appearance of skin texture and provide a natural-looking glow.', 'Natural Glow & Hydration', 1, 'AYUVEERA', 'A botanical face cream formulated with Shyamali, Neem, Sariva, Kumari and Yashtimadhu ingredients for daily skincare.', 'Face Cream', '50 g', '[\r\n        \"Supports natural skin hydration\",\r\n        \"Helps reduce skin dullness\",\r\n        \"May improve the appearance of skin complexion\",\r\n        \"Helps improve skin texture\",\r\n        \"Offers a natural-looking glow\"\r\n    ]', '[\r\n        \"Shamali Powder\",\r\n        \"Neem Leaves Powder\",\r\n        \"Sariva Bark Powder\",\r\n        \"Kumari Leaves Powder\",\r\n        \"Yashtimadhu Powder\",\r\n        \"Cream Base\",\r\n        \"Fragrance\"\r\n    ]', 'Apply liberally on a cleansed face and neck. Massage gently in circular motions.', 'For external use only. Avoid contact with eyes. Perform a patch test before first use. Discontinue use if irritation occurs.', 'Store in a cool and dry place, away from direct sunlight. Keep the container tightly closed.', 'Suitable for adults looking for daily skin hydration and skincare.', 'Herbal Face Cream', NULL, 'India', NULL, 'AYUVEERA TEJAS Face Cream 50g | Herbal Skincare', 'Discover AYUVEERA TEJAS Face Cream with Neem, Sariva, Kumari and Yashtimadhu for skin hydration and natural-looking glow.', NULL),
(21, 'Ayuveera Tejas Face Pack', 'Skin Care', 'skin-care', 499, 349, 4.6, '0', 'uploads/products/9a1ea15669ba000c959ee8d05cf8943a.jpg', 'AYUVEERA TEJAS Herbal Face Pack Paste is formulated with traditional botanical ingredients for facial cleansing and skincare.', 'Herbal Face Pack', 1, 'AYUVEERA', 'A herbal face pack paste with Arjuna, Ambehaldi, Neem, Tulsi, Lodhra and Ushira.', 'Face Pack Paste', '50 g', '[\r\n        \"Provides refreshed and glowing-looking skin\",\r\n        \"Helps calm and soothe skin\",\r\n        \"Helps cleanse dirt, excess oils and impurities\",\r\n        \"May help enhance natural-looking complexion\"\r\n    ]', '[\r\n        \"Arjuna Bark Powder\",\r\n        \"Ambehaldi Rhizome Powder\",\r\n        \"Neem Leaves Powder\",\r\n        \"Tulsi Leaves Powder\",\r\n        \"Lodhra Bark Powder\",\r\n        \"Ushira Rhizome Powder\",\r\n        \"Cream Base\",\r\n        \"Fragrance\"\r\n    ]', 'Apply over a cleansed face in smooth upward motions. Leave for 20 minutes. Rinse off with warm water and follow up with a moisturizer. For better effect, use with our face cream.', 'For external use only. Avoid contact with eyes. Perform a patch test before first use. Discontinue use if irritation occurs.', 'Store in a cool and dry place, away from direct sunlight. Keep the container tightly closed.', 'Adults looking for facial cleansing and skincare.', 'Herbal Face Pack', NULL, 'India', NULL, 'AYUVEERA TEJAS Face Pack 50g | Herbal Face Pack Paste', 'Discover AYUVEERA TEJAS Herbal Face Pack with Arjuna, Ambehaldi, Neem, Tulsi, Lodhra and Ushira.', NULL),
(22, 'Ayuveera Tejas Mud Pack', 'Skin Care', 'skin-care', 499, 320, 4.9, '0', 'uploads/products/b822f86d0b318df05d2797c0f637c541.png', 'AYUVEERA TEJAS Herbal Medicated Mud Pack is a botanical skincare formulation made with traditional herbs, Multani Mitti and cosmetic clays for facial cleansing and skincare.', 'Herbal Mud Pack', 1, 'AYUVEERA', 'A herbal mud pack formulated with Arjuna, Turmeric, Neem, Tulsi, Multani Mitti, Kaolin and Bentonite clay.', 'Mud Pack', '50 g', '[\r\n        \"Deep cleansing formula\",\r\n        \"May help tighten the appearance of loose and sagging skin\",\r\n        \"Helps improve skin lustre\",\r\n        \"Provides refreshed and glowing-looking skin\"\r\n    ]', '[\r\n        \"Arjuna Bark Powder\",\r\n        \"Turmeric Rhizome Powder\",\r\n        \"Neem Leaves Powder\",\r\n        \"Tulsi Leaves Powder\",\r\n        \"Multani Mitti\",\r\n        \"Kaolin Clay\",\r\n        \"Bentonite Clay\",\r\n        \"Glycerine\",\r\n        \"Water\",\r\n        \"Fragrance\"\r\n    ]', 'Apply over a cleansed face in smooth upward motions. Leave for 20 minutes. Rinse off with warm water and follow up with a moisturizer.', 'For external use only. Avoid contact with eyes. Perform a patch test before first use. Discontinue use if irritation occurs.', 'Store in a cool and dry place, away from direct sunlight. Keep the container tightly closed.', 'Adults looking for facial cleansing and skincare.', 'Herbal Medicated Mud Pack', NULL, 'India', NULL, 'AYUVEERA TEJAS Mud Pack 50g | Herbal Medicated Mud Mask', 'Discover AYUVEERA TEJAS Mud Pack with Multani Mitti, Kaolin, Bentonite and traditional botanical ingredients.', NULL),
(23, 'Ayuveera Tejas Scrub Cream', 'Skin Care', 'skin-care', 499, 299, 4.8, '0', 'uploads/products/9c5dd858b457590a6c9673dfa346c46a.jpg', 'AYUVEERA TEJAS Scrub Cream is a botanical skincare formulation with Neem, Sariva, Turmeric and Arjuna, designed for facial exfoliation and cleansing.', 'Herbal Scrub Cream', 1, 'AYUVEERA', 'A herbal scrub cream formulated with Neem, Sariva, Turmeric and Arjuna botanical ingredients for exfoliating skincare.', 'Scrub Cream', '50 g', '[\r\n        \"Helps remove dead skin cells\",\r\n        \"Helps reduce acne\",\r\n        \"Cleanses and nourishes your skin\",\r\n        \"Helps in removing blemishes\"\r\n    ]', '[\r\n        \"Neem Leaves Powder\",\r\n        \"Sariva Bark Powder\",\r\n        \"Turmeric Rhizome Powder\",\r\n        \"Arjuna Bark Powder\",\r\n        \"Fragrance\",\r\n        \"Cream Base\"\r\n    ]', 'Wet your skin and apply scrub cream. Massage your skin with brisk circular movements for about 2 minutes. Avoid contact with the eye area, then rinse and pat dry.', 'For external use only. Avoid contact with eyes. Do not apply to broken or irritated skin. Perform a patch test before first use. Discontinue use if irritation occurs.', 'Store in a cool and dry place, away from direct sunlight. Keep the container tightly closed.', 'Adults looking for facial exfoliation and cleansing.', 'Herbal Scrub Cream', NULL, 'India', NULL, 'AYUVEERA TEJAS Scrub Cream 50g | Herbal Face Scrub', 'Discover AYUVEERA TEJAS Scrub Cream with Neem, Sariva, Turmeric and Arjuna for facial exfoliation and cleansing.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `image_path` varchar(1000) NOT NULL,
  `position` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `position`, `created_at`) VALUES
(24, 16, 'uploads/products/1c2df29946efc1bcc12f5701dc7209c2.jpg', 0, '2026-10-31 09:09:26'),
(25, 16, 'uploads/products/ecc7c760683e46d8e61226438beddd33.jpg', 1, '2026-10-31 09:09:26'),
(26, 16, 'uploads/products/16d997ac16cfc9fa590bdc6167d19313.jpg', 2, '2026-10-31 09:09:26'),
(27, 23, 'uploads/products/9c5dd858b457590a6c9673dfa346c46a.jpg', 0, '2026-10-31 09:31:28'),
(28, 23, 'uploads/products/888174cc3170ac98e6b5aa3a45a0ff68.jpg', 1, '2026-10-31 09:31:28'),
(29, 23, 'uploads/products/05cf9ab08279eb5723e9d47b44263fab.jpg', 2, '2026-10-31 09:31:28'),
(33, 21, 'uploads/products/9a1ea15669ba000c959ee8d05cf8943a.jpg', 0, '2026-10-31 09:32:12'),
(34, 21, 'uploads/products/23f8fc221dd45181e67bbd468504dd23.jpg', 1, '2026-10-31 09:32:12'),
(35, 21, 'uploads/products/4665d1b2eb82da2cce1018d8121ae0a1.jpg', 2, '2026-10-31 09:32:12'),
(36, 20, 'uploads/products/6ad26153ccca18db0cce2278ce68190b.jpg', 0, '2026-10-31 09:32:56'),
(37, 20, 'uploads/products/4343f8bb9f52e8b62bdea1fa11e8006a.jpg', 1, '2026-10-31 09:32:56'),
(38, 20, 'uploads/products/dd1b0e4133d9ec2a20fa3c0e76673982.jpg', 2, '2026-10-31 09:32:56'),
(39, 20, 'uploads/products/d12a69dfd3687c70ad89a525c49fae0e.jpg', 3, '2026-10-31 09:32:56'),
(40, 19, 'uploads/products/c4bfa60e2d09076008d1e0b9a7a9cb07.jpg', 0, '2026-10-31 09:33:12'),
(41, 19, 'uploads/products/5417734ad2ab193d44d1860964151230.jpg', 1, '2026-10-31 09:33:12'),
(42, 18, 'uploads/products/b24c8c1e09480bd3414bb026fa43d845.jpg', 0, '2026-10-31 09:33:34'),
(43, 18, 'uploads/products/e0f110fba22c66093c90b8fe0563c3bb.jpg', 1, '2026-10-31 09:33:34'),
(44, 18, 'uploads/products/bccb5fba77898e437391d740ceb11a9d.jpg', 2, '2026-10-31 09:33:34'),
(45, 17, 'uploads/products/a2c849397f58257029ffcc5eb94037fe.jpg', 0, '2026-10-31 09:33:51'),
(46, 17, 'uploads/products/72d84e641888233e36051c1d67b73ebc.jpg', 1, '2026-10-31 09:33:51'),
(47, 17, 'uploads/products/284f3d41455d00caf1b689a7535c89c6.jpg', 2, '2026-10-31 09:33:51'),
(48, 22, 'uploads/products/b822f86d0b318df05d2797c0f637c541.png', 0, '2026-10-31 09:39:29'),
(49, 22, 'uploads/products/faf48d4a829c54b05dabd0902c45fee0.jpg', 1, '2026-10-31 09:39:29'),
(50, 22, 'uploads/products/e27f7d26161cc933697393a51cfcfc9a.jpg', 2, '2026-10-31 09:39:29');

-- --------------------------------------------------------

--
-- Table structure for table `product_ingredients`
--

CREATE TABLE `product_ingredients` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `ingredient_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `display_order` int(10) UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_ingredients`
--

INSERT INTO `product_ingredients` (`id`, `product_id`, `ingredient_name`, `quantity`, `unit`, `display_order`) VALUES
(1, 16, 'Ashwagandha (Withania somnifera)', 125.00, 'mg', 1),
(2, 16, 'Brahmi (Bacopa monnieri)', 125.00, 'mg', 2),
(3, 16, 'Mandukparnee (Centella asiatica)', 75.00, 'mg', 3),
(4, 16, 'Jatamansi (Nardostachys jatamansi DC)', 50.00, 'mg', 4),
(5, 16, 'Khurasani Ajwain (Hyoscyamus niger)', 50.00, 'mg', 5),
(6, 16, 'Pippali (Piper longum)', 25.00, 'mg', 6),
(7, 16, 'Shankhpushpi (Convolvulus pluricaulis)', 50.00, 'mg', 7),
(32, 17, 'Amla (Emblica officinalis)', 3.00, '%', 1),
(33, 17, 'Shikakai (Acacia concinna)', 3.00, '%', 2),
(34, 17, 'Aritha (Sapindus mukorossi Gaertn)', 3.00, '%', 3),
(35, 17, 'Bhringraj (Eclipta alba)', 1.00, '%', 4),
(36, 17, 'Methi Seeds (Trigonella foenum-graecum)', 1.00, '%', 5),
(37, 17, 'Kalonji Seeds (Nigella sativa)', 1.00, '%', 6),
(38, 17, 'Neem Leaves (Azadirachta indica)', 5.00, '%', 7),
(39, 17, 'Aloe Vera Pulp (Aloe barbadensis)', 5.00, '%', 8),
(40, 17, 'Henna Leaves (Lawsonia inermis)', 5.00, '%', 9),
(41, 17, 'Jaswant Leaves (Hibiscus rosa-sinensis)', 3.00, '%', 10),
(42, 17, 'Betel Leaves (Piper betle)', 5.00, '%', 11),
(43, 17, 'Curry Leaves (Murraya koenigii)', 5.00, '%', 12),
(44, 18, 'Coconut Oil (Cocos nucifera)', 100.00, 'ml', 1),
(45, 18, 'Henna Leaf (Lawsonia inermis)', 4.00, 'g', 2),
(46, 18, 'Brahmi Leaf (Bacopa monnieri)', 4.00, 'g', 3),
(47, 18, 'Aloe Vera Leaf (Aloe barbadensis)', 4.00, 'g', 4),
(48, 18, 'Betel Leaf (Piper betle)', 4.00, 'g', 5),
(49, 18, 'Methi Seed Powder (Trigonella foenum-graecum)', 1.25, 'g', 6),
(50, 18, 'Kalonji Seed Powder (Nigella sativa)', 1.25, 'g', 7),
(51, 18, 'Bhringraj Powder (Eclipta alba)', 1.25, 'g', 8),
(52, 18, 'Amla Powder (Emblica officinalis)', 1.25, 'g', 9),
(53, 18, 'Jaswand Flower (Hibiscus rosa-sinensis)', 2.00, 'g', 10),
(54, 18, 'Sarso Oil (Brassica juncea)', 0.63, 'ml', 11),
(55, 18, 'Kapoor Oil (Cinnamomum camphora)', 1.00, 'ml', 12),
(56, 18, 'Fragrance (Almond)', NULL, 'q.s.', 13),
(57, 19, 'Ajma Churna (Trachyspermum ammi)', 50.00, 'mg', 1),
(58, 19, 'Belgarga Ghana (Aegle marmelos)', 50.00, 'mg', 2),
(59, 19, 'Chitrak Ghana (Plumbago zeylanica)', 50.00, 'mg', 3),
(60, 19, 'Haritaki (Terminalia chebula)', 100.00, 'mg', 4),
(61, 19, 'Indrajav Churna (Holarrhena antidysenterica)', 50.00, 'mg', 5),
(62, 19, 'Jeera Churna (Cuminum cyminum)', 50.00, 'mg', 6),
(63, 19, 'Kutaj Ghana (Holarrhena antidysenterica)', 50.00, 'mg', 7),
(64, 19, 'Shunthi Churna (Zingiber officinale)', 50.00, 'mg', 8),
(65, 19, 'Triphala Churna', 100.00, 'mg', 9),
(66, 19, 'Trikatu Kadha', NULL, 'Bhavana Dravya', 10),
(67, 19, 'Amalavetas Quath (Garcinia pedunculata)', NULL, 'Bhavana Dravya', 11),
(68, 19, 'Excipient', NULL, 'q.s.', 12),
(69, 20, 'Shamali Powder (Bombax malabaricum)', 0.50, '%', 1),
(70, 20, 'Neem Leaves Powder (Azadirachta indica)', 0.50, '%', 2),
(71, 20, 'Sariva Bark Powder (Hemidesmus indicus)', 0.25, '%', 3),
(72, 20, 'Kumari Leaves Powder (Aloe barbadensis)', 0.50, '%', 4),
(73, 20, 'Yashtimadhu Powder (Glycyrrhiza glabra)', 0.50, '%', 5),
(74, 20, 'Cream Base', NULL, 'q.s.', 6),
(75, 20, 'Fragrance', NULL, 'q.s.', 7),
(76, 21, 'Arjuna Bark Powder (Terminalia arjuna)', 0.10, '%', 1),
(77, 21, 'Ambehaldi Rhizome Powder (Curcuma amada)', 0.10, '%', 2),
(78, 21, 'Neem Leaves Powder (Azadirachta indica)', 0.10, '%', 3),
(79, 21, 'Tulsi Leaves Powder (Ocimum sanctum)', 0.10, '%', 4),
(80, 21, 'Lodhra Bark Powder (Symplocos racemosa)', 0.10, '%', 5),
(81, 21, 'Ushira Rhizome Powder (Vetiveria zizanioides)', 0.10, '%', 6),
(82, 21, 'Cream Base', NULL, 'q.s.', 7),
(83, 21, 'Fragrance', NULL, 'q.s.', 8),
(84, 22, 'Arjuna Bark Powder (Terminalia arjuna)', 1.00, '%', 1),
(85, 22, 'Turmeric Rhizome Powder (Curcuma longa)', 1.00, '%', 2),
(86, 22, 'Neem Leaves Powder (Azadirachta indica)', 1.00, '%', 3),
(87, 22, 'Tulsi Leaves Powder (Ocimum sanctum)', 1.00, '%', 4),
(88, 22, 'Multani Mitti', 21.50, '%', 5),
(89, 22, 'Kaolin Clay', 10.00, '%', 6),
(90, 22, 'Bentonite Clay', 5.50, '%', 7),
(91, 22, 'Glycerine and Water', NULL, 'q.s. to 100%', 8),
(92, 22, 'Fragrance', NULL, 'q.s.', 9),
(93, 23, 'Neem Leaves Powder (Azadirachta indica)', 0.50, '%', 1),
(94, 23, 'Sariva Bark Powder (Hemidesmus indicus)', 0.50, '%', 2),
(95, 23, 'Turmeric Rhizome Powder (Curcuma longa)', 0.20, '%', 3),
(96, 23, 'Arjuna Bark Powder (Terminalia arjuna)', 0.50, '%', 4),
(97, 23, 'Fragrance', NULL, 'q.s.', 5),
(98, 23, 'Cream Base', NULL, 'q.s.', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_phone_created` (`phone`,`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category_active` (`category`,`is_active`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_images_position` (`product_id`,`position`);

--
-- Indexes for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD CONSTRAINT `product_ingredients_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
