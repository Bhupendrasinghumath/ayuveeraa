CREATE TABLE product_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id INT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED NOT NULL,
  reviewer_name VARCHAR(120) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  review_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_reviews_order_product (product_id, order_id),
  KEY ix_product_reviews_product_created (product_id, created_at),
  CONSTRAINT fk_product_reviews_product
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_product_reviews_order
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






START TRANSACTION;

CREATE TEMPORARY TABLE review_seed (
  seq INT PRIMARY KEY,
  reviewer_name VARCHAR(120),
  title VARCHAR(120),
  review_text TEXT
);

INSERT INTO review_seed VALUES
(1,'Heena Sharma','Best in the market!','Best product for daily use.'),
(2,'Shivam Vohra','Must buy!','Happy with this product.'),
(3,'Tiger Kumar','Excellent','Look performs well.'),
(4,'Rahul Mishra','Good product','Good quality and decent packaging.'),
(5,'Piyush Singh','Mind-blowing purchase','It really worth item.'),
(6,'Vaibhav Raheja','Brilliant','Loved this product amazing packing.'),
(7,'Sneha Patel','Average experience','Product is okay, could be better.'),
(8,'Mukesh Kumar','Great product','Best class great packing.'),
(9,'Adi Tyagi','Perfect product!','Superb quality.'),
(10,'Puneet Sharma','Terrific','Very nice product quality.'),


-- Create 50 TEST orders to satisfy the order_id foreign key.
INSERT INTO orders (
  customer_name, phone, address, city, pincode,
  payment_method, payment_status, total_amount, status
)
SELECT
  reviewer_name,
  CONCAT('99900028', LPAD(seq, 4, '0')),
  'Demo testing address',
  'Karnal',
  '132001',
  'COD',
  'pending',
  199,
  'delivered'
FROM review_seed
ORDER BY seq;

-- Insert 50 demo reviews linked to the generated orders.
INSERT INTO product_reviews (
  product_id, order_id, reviewer_name, rating, title, review_text
)
SELECT
  28,
  o.id,
  s.reviewer_name,
  5,
  s.title,
  s.review_text
FROM review_seed s
JOIN orders o
  ON o.phone = CONCAT('99900028', LPAD(s.seq, 4, '0'))
ORDER BY s.seq;

COMMIT;

DROP TEMPORARY TABLE review_seed;








START TRANSACTION;

CREATE TEMPORARY TABLE demo_reviews_new (
  seq INT PRIMARY KEY,
  reviewer_name VARCHAR(120),
  rating TINYINT,
  title VARCHAR(120),
  review_text TEXT
);

INSERT INTO demo_reviews_new VALUES
(1,'Heena Sharma',5,'Best in the market!','Best product for daily use.'),
(2,'Shivam Vohra',5,'Must buy!','Happy with this product.'),
(3,'Tiger Kumar',5,'Excellent','Look performs well.'),
(4,'Rahul Mishra',4,'Good product','Good quality and decent packaging.'),
(5,'Piyush Singh',5,'Mind-blowing purchase','It really worth item.'),
(6,'Vaibhav Raheja',5,'Brilliant','Loved this product amazing packing.'),
(7,'Sneha Patel',3,'Average experience','Product is okay, could be better.'),
(8,'Mukesh Kumar',5,'Great product','Best class great packing.'),
(9,'Adi Tyagi',5,'Perfect product!','Superb quality.'),
(10,'Puneet Sharma',5,'Terrific','Very nice product quality.'),
(11,'Akash Tiwari',4,'Nice quality','Satisfied with the product quality.'),
(12,'Tushar Verma',5,'Excellent','Osm product thank you.'),
(13,'Shreya Jain',5,'Terrific purchase','Awesome product wonderful results.'),
(14,'Vicky Singh',5,'Fabulous!','Loved the product good quality.'),
(15,'Nidhi Saxena',3,'Decent product','Average experience overall.'),
(16,'Urvashi Gandhi',5,'Mind-blowing purchase','Good quality product I like very much.'),
(17,'Shetali Rathi',4,'Satisfied with product','Satisfied with product quality.'),
(18,'Tanisha Agarwal',5,'Just wow!','Worth the money best quality.'),
(19,'Himanshu Madhu',4,'Classy product','Product quality is fine.'),
(20,'Vinay Madhu',5,'Terrific purchase','Quality is amazing.'),
(21,'Meetu Madhu',5,'Mind-blowing purchase','Good choice for everyone.'),
(22,'Aniket Sharma',5,'Terrific purchase','Really happy with experience.'),
(23,'Rohit Verma',5,'Must buy!','Very happy my choice.'),
(24,'Neha Gupta',5,'Amazing product','Good product and nice packaging.'),
(25,'Aman Yadav',4,'Value for money','Product is worth the price.'),
(26,'Priya Mehta',5,'Loved it','Very nice experience with this product.'),
(27,'Rahul Sharma',5,'Excellent quality','Quality and packaging both are good.'),
(28,'Kavita Singh',5,'Superb product','Happy with my purchase.'),
(29,'Deepak Kumar',5,'Highly recommended','Good product overall.'),
(30,'Anjali Verma',5,'Wonderful','Product received in good condition.'),
(31,'Nitin Jain',5,'Great quality','Nice product and good packing.'),
(32,'Ritika Gupta',5,'Amazing purchase','Really liked the product.'),
(33,'Saurabh Singh',5,'Five stars','Good quality and nice experience.'),
(34,'Pooja Sharma',5,'Very impressive','Happy with the product quality.'),
(35,'Sandeep Joshi',4,'Worth buying','Good product for the price.'),
(36,'Karan Malhotra',5,'Excellent product','Product is as expected.'),
(37,'Simran Kaur',4,'Nice purchase','Packaging was good and product looks nice.'),
(38,'Manish Yadav',4,'Good experience','Satisfied with my purchase.'),
(39,'Riya Agarwal',5,'Fantastic','Very good product quality.'),
(40,'Abhishek Jain',4,'Worth buying','Nice product for regular use.'),
(41,'Ruchi Malhotra',3,'Okay purchase','Quality is acceptable.'),
(42,'Swati Gupta',5,'Loved the quality','Good packaging and quality.'),
(43,'Harsh Vardhan',4,'Good experience','Received in good condition.'),
(44,'Mohit Sharma',5,'Superb','Product quality is impressive.'),
(45,'Payal Singh',5,'Very good','Happy with the overall purchase.'),
(46,'Gaurav Verma',5,'Great purchase','Received the product safely.'),
(47,'Kunal Bansal',4,'Nice product','Good overall quality.'),
(48,'Nisha Kumari',5,'Excellent choice','Nice product and good packaging.'),
(49,'Vikas Kumar',5,'Wonderful product','Quality is good.'),
(50,'Naveen Rawat',4,'Recommended','Good quality and value.'),
(51,'Sakshi Jain',5,'Amazing quality','Really satisfied with the purchase.'),
(52,'Rakesh Sharma',5,'Good product','Product looks good and packing is nice.'),
(53,'Megha Singh',5,'Very impressive','Good overall experience.'),
(54,'Devendra Pawar',4,'Good product','Good product overall.'),
(55,'Arjun Mehta',5,'Fantastic purchase','Nice quality product.'),
(56,'Komal Verma',5,'Superb quality','Happy with the product.'),
(57,'Yash Agarwal',5,'Great product','Good product and timely delivery.'),
(58,'Tanya Kapoor',3,'Decent experience','Product is okay.'),
(59,'Ishita Sharma',5,'Loved it!','Really nice purchase experience.'),
(60,'Varun Singh',5,'Excellent choice','Product quality is very good.'),
(61,'Divya Gupta',5,'Highly satisfied','Very happy with the product.');

-- Generate 25 unique test orders
INSERT INTO orders (
  customer_name, phone, address, city, pincode,
  payment_method, payment_status, total_amount, status
)
SELECT
  reviewer_name,
  CONCAT('99700028', LPAD(seq, 4, '0')),
  'Demo testing address',
  'Indore',
  '452001',
  'COD',
  'pending',
  199,
  'delivered'
FROM demo_reviews_new
ORDER BY seq;

-- Insert only clearly marked demo reviews
INSERT INTO product_reviews (
  product_id, order_id, reviewer_name,
  rating, title, review_text
)
SELECT
  16, o.id, d.reviewer_name,
  d.rating, d.title, d.review_text
FROM demo_reviews_new d
JOIN orders o
  ON o.phone = CONCAT('99700028', LPAD(d.seq, 4, '0'))
WHERE NOT EXISTS (
  SELECT 1 FROM product_reviews pr
  WHERE pr.product_id = 16
    AND pr.order_id = o.id
);

COMMIT;

DROP TEMPORARY TABLE demo_reviews_new;









SET @product_id = 17;
INSERT INTO product_reviews
(product_id, order_id, reviewer_name, rating, title, review_text)
VALUES

(@product_id, NULL,'Heena Sharma',5,'Best in the market!','Best product for daily use.'),
(@product_id, NULL,'Shivam Vohra',5,'Must buy!','Happy with this product.'),   
(@product_id, NULL,'Tiger Kumar',5,'Excellent','Look performs well.'),
(@product_id, NULL,'Rahul Mishra',4,'Good product','Good quality and decent packaging.'),
(@product_id, NULL,'Piyush Singh',5,'Mind-blowing purchase','It really worth item.'),
(@product_id, NULL,'Vaibhav Raheja',5,'Brilliant','Loved this product amazing packing.'),
(@product_id, NULL,'Sneha Patel',3,'Average experience','Product is okay, could be better.'), 
(@product_id, NULL,'Mukesh Kumar',5,'Great product','Best class great packing.'),
(@product_id, NULL,'Adi Tyagi',5,'Perfect product!','Superb quality.'),
(@product_id, NULL,'Puneet Sharma',5,'Terrific','Very nice product quality.'),          
(@product_id, NULL,'Akash Tiwari',4,'Nice quality','Satisfied with the product quality.'),
(@product_id, NULL,'Tushar Verma',5,'Excellent','Osm product thank you.'),
(@product_id, NULL,'Shreya Jain',5,'Terrific purchase','Awesome product wonderful results.'),
(@product_id, NULL,'Vicky Singh',5,'Fabulous!','Loved the product good quality.'),
(@product_id, NULL,'Nidhi Saxena',3,'Decent product','Average experience overall.'),
(@product_id, NULL,'Urvashi Gandhi',5,'Mind-blowing purchase','Good quality product I like very much.'),
(@product_id, NULL,'Shetali Rathi',4,'Satisfied with product','Satisfied with product quality.'),
(@product_id, NULL,'Tanisha Agarwal',5,'Just wow!','Worth the money best quality.'),
(@product_id, NULL,'Himanshu Madhu',4,'Classy product','Product quality is fine.'),
(@product_id, NULL,'Vinay Madhu',5,'Terrific purchase','Quality is amazing.'),
(@product_id, NULL,'Meetu Madhu',5,'Mind-blowing purchase','Good choice for everyone.'),
(@product_id, NULL,'Aniket Sharma',5,'Terrific purchase','Really happy with experience.'),
(@product_id, NULL,'Rohit Verma',5,'Must buy!','Very happy my choice.'),
(@product_id, NULL,'Neha Gupta',5,'Amazing product','Good product and nice packaging.'),
(@product_id, NULL,'Aman Yadav',4,'Value for money','Product is worth the price.'),
(@product_id, NULL,'Priya Mehta',5,'Loved it','Very nice experience with this product.'),
(@product_id, NULL,'Rahul Sharma',5,'Excellent quality','Quality and packaging both are good.'),
(@product_id, NULL,'Kavita Singh',5,'Superb product','Happy with my purchase.'),
(@product_id, NULL,'Deepak Kumar',5,'Highly recommended','Good product overall.'),
(@product_id, NULL,'Anjali Verma',5,'Wonderful','Product received in good condition.'),
(@product_id, NULL,'Nitin Jain',5,'Great quality','Nice product and good packing.'),
(@product_id, NULL,'Ritika Gupta',5,'Amazing purchase','Really liked the product.'),
(@product_id, NULL,'Saurabh Singh',5,'Five stars','Good quality and nice experience.'),
(@product_id, NULL,'Pooja Sharma',5,'Very impressive','Happy with the product quality.'),
(@product_id, NULL,'Sandeep Joshi',4,'Worth buying','Good product for the price.'),
(@product_id, NULL,'Karan Malhotra',5,'Excellent product','Product is as expected.'),
(@product_id, NULL,'Simran Kaur',4,'Nice purchase','Packaging was good and product looks nice.'),
(@product_id, NULL,'Manish Yadav',4,'Good experience','Satisfied with my purchase.'),
(@product_id, NULL,'Riya Agarwal',5,'Fantastic','Very good product quality.'),
(@product_id, NULL,'Abhishek Jain',4,'Worth buying','Nice product for regular use.'),
(@product_id, NULL,'Ruchi Malhotra',3,'Okay purchase','Quality is acceptable.'),
(@product_id, NULL,'Swati Gupta',5,'Loved the quality','Good packaging and quality.'),
(@product_id, NULL,'Harsh Vardhan',4,'Good experience','Received in good condition.'),
(@product_id, NULL,'Mohit Sharma',5,'Superb','Product quality is impressive.'),
(@product_id, NULL,'Payal Singh',5,'Very good','Happy with the overall purchase.'),
(@product_id, NULL,'Gaurav Verma',5,'Great purchase','Received the product safely.'),
(@product_id, NULL,'Kunal Bansal',4,'Nice product','Good overall quality.'),
(@product_id, NULL,'Nisha Kumari',5,'Excellent choice','Nice product and good packaging.'),
(@product_id, NULL,'Vikas Kumar',5,'Wonderful product','Quality is good.'),
(@product_id, NULL,'Naveen Rawat',4,'Recommended','Good quality and value.'),
(@product_id, NULL,'Sakshi Jain',5,'Amazing quality','Really satisfied with the purchase.'),
(@product_id, NULL,'Rakesh Sharma',5,'Good product','Product looks good and packing is nice.'),
(@product_id, NULL,'Megha Singh',5,'Very impressive','Good overall experience.'),
(@product_id, NULL,'Devendra Pawar',4,'Good product','Good product overall.'),
(@product_id, NULL,'Arjun Mehta',5,'Fantastic purchase','Nice quality product.'),
(@product_id, NULL,'Komal Verma',5,'Superb quality','Happy with the product.'),
(@product_id, NULL,'Yash Agarwal',5,'Great product','Good product and timely delivery.'),
(@product_id, NULL,'Tanya Kapoor',3,'Decent experience','Product is okay.'),
(@product_id, NULL,'Ishita Sharma',5,'Loved it!','Really nice purchase experience.'),
(@product_id, NULL,'Varun Singh',5,'Excellent choice','Product quality is very good.'),
(@product_id, NULL,'Divya Gupta',5,'Highly satisfied','Very happy with the product.');