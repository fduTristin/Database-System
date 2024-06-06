# Database Design and E-R Model

## Overview of the Design Process

* Tasks involved in developing database application

![6.1](pictures/6.1.png)

* Data Abstraction

![6.2](pictures/6.2.png)

* Database Design

  * Conceptual design (概念设计)
    * Mapping a real world organization to a conceptual model
  * Logical design (逻辑设计)
    * Transforming the conceptual model to a logical model
  * Physical design (物理设计)
    * Instantiating the logical model to physical organization and storage

## Entity-Relationship Model

* E-R Diagrams in College

![6.3](pictures/6.3.png)

* A database ‘schema’ in the ER Model can be represented pictorially using **ER diagram**
* Can map an ER diagram into a relational schema

* three concepts of E-R Model
  * Entity set
  * Attributes
  * Relationship sets

### Entity sets

* A database can be modeled as
  * a collection of entities
  * relationship among entities

* An entity is an object that exists and is distinguishable from other objects
  * e.g. specific person, company, event...

* Entities have attributes

* An entity set is a set of entities of the same type that share the same properties

* Extension of the entity set is the actual collection of entities belonging to the entity set

### Attributes

* attribute types
  * simple and composite attributes
  * single-valued and multi-valued attributes
  * derived attributes

![6.4](pictures/6.4.png)

### Relational Sets

* a relationship is an association among several entities

* a relationship set is a mathematical relation among $n\geq2$ entities, each taken from entity sets $\{(e_1,e_2,\cdots,e_n)|e_1\in E_1,e_2\in E_2,\cdots,e_n\in E_n\}$
where $(e_1,e_2,\cdots,e_n)$ is a relationship

* relationship set borrower

![6.5](pictures/6.5.png)

* an attribute can also be property of a relationship set

* the depositor relationship set between entity sets customer and account may have the attribute access-date

![6.6](pictures/6.6.png)

* degree of a relationship set
  * the number of entity sets that participate in a relational set
    * relationship sets that involve two entity sets are binary
    * most are binary

## Constraints

### Mapping Cardinalities

* For a binary relationship set, the mapping cardinality must be one of the following types:
  * one to one
  * one to many
  * many to one
  * many to many

* Note: some elements in A and B may not be mapped to any element in the other set

![6.7](pictures/6.7.png)

![6.8](pictures/6.8.png)

* mapping cardinalities affect ER design
  * Can make access-date an attribute of account, instead of a relationship attribute, if each account can have only one customer
  ![6.9](pictures/6.9.png)

### Participation Constraints

* total participation  (indicated by double line)
  * Every entity in the entity set participates in at least one relationship in the relationship set
* partial participation

![6.10](pictures/6.10.png)

## E-R Diagrams

* Rectangles represent entity sets
* Diamonds represent relationship sets.
* Lines link attributes to entity sets and entity sets to relationship 
sets.
* Ellipses represent attributes
  * Double ellipses represent multi-valued attributes
  * Dashed ellipses denote derived attributes
* Underline indicates primary key attributes

![6.11](pictures/6.11.png)

![6.12](pictures/6.12.png)

![6.13](pictures/6.13.png)

### Roles

* Entity sets of a relationship need not be distinct
– The labels “manager” and “worker” are called roles; they specify how employee entities interact via the works-for relationship set
– Role labels are optional and used to clarify semantics of the relationship

![6.14](pictures/6.14.png)

### Cardinality Constraints

* We express cardinality constraints by drawing either a directed line (→), signifying “one,” or an undirected line (—), signifying “many,” between the relationship set and the entity set.

![6.15](pictures/6.15.png)

### Alternative Notation for Cardinality Limits

* Notation: 𝒎..𝒏, where 𝒎 and 𝒏 are the minimum and maximum 
cardinalities respectively
– m=0: each entity may not participate the relationship set (partial participation)
– m=1: each entity participates at least one relationship of the relationship set 
(full participation)
– n=1: each entity participates at most one relationship of the relationship set
– n=*: each entity participates many relationships of the relationship set

![6.16](pictures/6.16.png)

### Keys

* Let R be a relationship set involving entity sets E1, E2,…, En. Let primary-key(Ei) denote the set of attributes that forms the primary key for entity set Ei. Assume all the primary-key(Ei) are unique
* If the relationship set R has no attributes associated with it, then the set of attributes describes an individual relationship in set R

  $primary-key(E_1)\cup primary-key(E_2)\cup\cdots\cup primary-key(E_n)$
* If the relationship set R has attributes a1, a2,…, am associated with it, then the set of attributes describes an individual relationship in set R

  $primary-key(E_1)\cup primary-key(E_2)\cup\cdots\cup primary-key(E_n)\cup\{a_1,a_2,\cdots,a_m\}$
* The combination of primary keys of the participating entity sets forms a super key of a relationship set
* Must consider the mapping cardinality of the relationship set when deciding what are the candidate keys
* Need to consider semantics of relationship set in selecting the primary key in case of more than one candidate key

* consider binary relationships
  * For many-to-many relationships, the preceding union of the primary keys is a minimal superkey and is chosen as the primary key
  * For one-to-many and many-to-one relationships, the primary key of the "many" side is a minimal superkey and is used as the primary key

## Reduction to Relation Schemas

## Summary
