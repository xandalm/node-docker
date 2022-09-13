-- MYSQL SCHEMA

CREATE DATABASE IF NOT EXISTS nodedocker;

USE nodedocker;

CREATE TABLE IF NOT EXISTS `Persons` (
    `id` INT UNSIGNED AUTO_INCREMENT,
    `public_id` VARCHAR(36) NOT NULL,
    `first_name` VARCHAR(25) NOT NULL,
    `last_name` VARCHAR(25) NOT NULL,
    `birthday` DATE NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `status` TINYINT(1) NOT NULL,
    `created_moment` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `deleted_moment` DATETIME,

    INDEX(`public_id`),
    INDEX(`email`),

    CONSTRAINT `PK_Persons` PRIMARY KEY (`id`),
    CONSTRAINT `UQ_Persons_public_id` UNIQUE (`public_id`),
    CONSTRAINT `UQ_Persons_email` UNIQUE (`email`)
);

CREATE TABLE IF NOT EXISTS `Contacts` (
    `owner` INT UNSIGNED NOT NULL,
    `person` INT UNSIGNED NOT NULL,
    `created_moment` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `deleted_moment` DATETIME,

    CONSTRAINT `PK_Contacts` PRIMARY KEY (`owner`,`person`),
    CONSTRAINT `FK_Contacts_owner` FOREIGN KEY (`owner`) REFERENCES `Persons`(`id`),
    CONSTRAINT `FK_Contacts_person` FOREIGN KEY (`person`) REFERENCES `Persons`(`id`)
);

CREATE TABLE IF NOT EXISTS `ContactsGroups` (
    `id` INT UNSIGNED AUTO_INCREMENT,
    `owner` INT UNSIGNED NOT NULL,
    `public_id` VARCHAR(5),
    `description` VARCHAR(50),
    `created_moment` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),

    INDEX(`public_id`),

    CONSTRAINT `PK_ContactsGroups` PRIMARY KEY (`id`),
    CONSTRAINT `FK_ContactsGroups_owner` FOREIGN KEY (`owner`) REFERENCES `Persons`(`id`),
    CONSTRAINT `UQ_Persons_public_id` UNIQUE (`public_id`),
    CONSTRAINT `UQ_ContactsGroups_desc` UNIQUE (`owner`,`description`)
);

-- ContactsGroup and Contacts Link
CREATE TABLE IF NOT EXISTS `ContactsGroupsLinks` ( 
    `group` INT UNSIGNED NOT NULL, 
    `owner` INT UNSIGNED NOT NULL, 
    `person` INT UNSIGNED NOT NULL, 
    `created_moment` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),

    INDEX (`owner`),
    INDEX (`owner`,`group`),

    CONSTRAINT `FK_CGL_group` FOREIGN KEY (`group`) REFERENCES `ContactsGroups`(`id`), 
    CONSTRAINT `FK_CGL_contact` FOREIGN KEY (`owner`,`person`) REFERENCES `Contacts`(`owner`,`person`) 
);
