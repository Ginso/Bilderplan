SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `Formation_Bilder` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pairs` int NOT NULL,
  `bilder` json NOT NULL,
  `saved` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `team` varchar(8) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `Formation_Bilder` (`pairs`, `lastId`, `team`, `bilder`) VALUES
(8, 0, '', '[{\"id\": 0, \"point\": \"\", \"title\": \"Start\", \"leaders\": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]}]');

COMMIT;