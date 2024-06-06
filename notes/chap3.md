# Introduction to SQL

* Data definition language (DDL)
  * relation schemmas
  * Integrity constraints
  * view defintion
  * authorization

* Data manipulation language (DML)
  * queries
  * insertion,deletion,updates
  * transaction processing

## SQL Data Definiton

### Domain Types in SQL

* ***char(n)***
--- fixed length character string, with user-specified length ***n***
* ***varchar(n)***
--- Variable length character strings, with user-specified maximum length ***n***
* ***int***
--- integer(a finite subset of the integers that is machine-dependent)
* ***smallint***
--- small integer
* ***numeric(p,d)***
--- Fixed point number (定点数), with user-specified precision of ***p*** digits, with ***d*** digits to the right of decimal point
---  ***numeric(3,1)*** allows 44.5 to be stored exactly, but neither 444.5 nor 0.32 can be stored exactly in a field of this type
* ***real, double precision***
--- loating point and double-precision floating point numbers, with machine-dependent precision
* ***float(n)***
--- Floating point number, with user-specified precision of at least ***n*** digits
* ***null***
--- Allowed in all domain types. Declaring an attribute to be $\textcolor{red}{not~null}$ prohibits null values for that attribute.

* Date/Time Types in SQL

  * ***date***
    --- dates, containing a (4 digits) year, month and date
    --- e.g. date '2020-9-30'
  * ***time***
    --- time of day,in hours, minutes, seconds
    --- e.g. time '09:25:30.75'
  * ***timestamp***
    --- date plus time of day
  * ***interval***: period of time
    --- Subtracting a date/time/timestamp value from another gives an interval value, e.g., Interval '1' day
    --- Interval values can be added to date/time/timestamp values
  * ***Extract*** values of individual fields from date/time/timestamp
    –-- E.g., ***extract*** (year from r.starttime)
  * ***Cast*** string types to date/time/timestamp
    --- e.g. ***cast*** ***<***string-valued-expression***>*** as date

### Basic Schema Definition

*An SQl relation is defined using the **create table** command*

```sql
create table 𝒓(𝑨𝟏 𝑫𝟏,𝑨𝟐 𝑫𝟐, … , 𝑨𝒏 𝑫𝒏,
𝒊𝒏𝒕𝒆𝒈𝒓𝒊𝒕𝒚_𝒄𝒐𝒏𝒔𝒕𝒓𝒂𝒊𝒏𝒕𝟏 , … , (𝒊𝒏𝒕𝒆𝒈𝒓𝒊𝒕𝒚_𝒄𝒐𝒏𝒔𝒕𝒓𝒂𝒊𝒏𝒕𝒌))
```

* ***r***  is the name of the relation
* Each ***Ai*** is an attribute name in the schema of relation ***r***
* ***Di*** is the data type of values in the domain of attribute ***Ai***

*example:*

```sql
create table branch
(branch_name char(15) not null,
branch_city char(30),
assets integer)
```

#### Integrity Constraints in Creating Tables

```sql
not null
primary key (A1,A2,...An)
foreign key (Ak1,Ak2,...,Akn) references s
check(P) --  P is a predicate 
--e.g.
create table instructor
(ID varchar(5),
name varchar(20) not null,
dept_name varchar(20),
salary numeric(8, 2),
primary key (ID),
check (salary >= 0))
```

* *Note:  **Primary key** declaration on an attribute automatically ensures **not null** and **unique** in SQL-92 onwards, needs to be explicitly stated in SQL-89*

#### Basic Insertion and Deletion of Tuples

* Newly created table is empty
* Add a new tuple to a table instructor

    ```sql
    insert into instructor values ('10211', 'Smith', 'Computer Science', 66000)
    ```

--- insertion failed if any integrity constraint is violated

* delete all tuples from table instructor

    ```sql
    delete from instructor
    ```

#### Drop and Alter Table Constructs

* The **drop table** command deletes all information (both schema and tuples) about the dropped relation from the database
* The **alter table** command is used to add attributes to an existing relation

    ```sql
    alter table r add A D
    ```

--- All tuples in the relation are assigned **null** as the value for the new attribute.

* The alter table command can also be used to drop attributes of a relation

    ```sql
    alter table r drop A
    ```

---dropping of atrributes not supported by many databases

## Basic Structure of SQL Queries

*SQL is based on **set** and **relational operations** with certain modifications and enhancements*

* a typical SQL query has the form:

    ```sql
    select A1, A2, ..., An
    from r1, r2, ..., rm
    where P
    ```

* this query is equivalent to the relational algebra expression:

    $\Pi_{A_1,A_2,\cdots,A_n}(\sigma_P(r_1\times r_2\times\cdots\times r_n))$

* the result of an SQL query is a relation

### The select Clause

* The select clause lists the attributes desired in the result of a query – corresponds to the projection operation of the RA (relational algebra)

* e.g.

    ```sql
    select dept_name
    from instructor
    ```

---Note: SQL names are **case insensitive**, i.e. you can use capital or small letters

* SQL allows duplicate in relations. TO eliminate this, insert the keyword **distinct** after select, like this:

    ```sql
    select distinct dept_name
    from instructor
    ```

* the keyword **all** specified that duplicated should be kept by default:

    ```sql
    select all dept_name
    from instructor
    ```

* An asterisk in the select clause denotes "all attributes":

    ```sql
    select *
    from instructor
    ```

* the select clause can contain arithmetic expressions (+, -, *, /), such as:

    ```sql
    select ID, dept_name, salary*1.1
    from instructor
    ```

### The where Clause

* The **where clause** specified conditions that the result must satisfy
  * e.g. to find all loan numbers for loans made at the Perryridge branch with loan amount greater than $1200.

    ```sql
    select loan_number
    from loan
    where branch_name = 'Perryridge' and amount > 1200
    ```

  * Comparison results can be combined using the logical connectives **and,or,not**
  * Comparison can be applied to results of arithmetic expressions
* SQL includes a **between** comparison operator, e.g.

    ```sql
    select loan_number
    from loan
    where amount between 90000 and 100000
    ```

### The from Clause

* The **from clause** lists the relations involved in the query
  * corresponds to the Cartesian product operation of the RA
* e.g. find the Cartesian product *borrower × loan*

    ```sql
    select *
    from borrower, loan
    ```

### The Natural Join

```sql
select A1, A2,…, An
from r1 natural join r2 natural join …natural join rm
where P;
```

*Notice that we do not repeat those attributes that appear in the schemas of both relations; rather they appear only once. Notice also the order in which the attributes are listed: first the attributes common to the schemas of both relations, second those attributes unique to the schema of the first relation, and finally, those attributes unique to the schema of the second relation.*

* joining ... using ...

    ```sql
    select name, title
    from (instructor natural join teaches) join course using (course_id)
    -- it is equivalent to
    select name, title
    from instructor natural join teaches,course
    where teaches.course_id = course.course_id
    ```

## Additional Basic Operations

### rename

```sql
old_name as new_name
----------------------------------------------------------------
select customer_name, borrower.loan_number as loan_id, amount 
from borrower, loan
where borrower.loan_number = loan.loan_number
```

### tuple variables are defined in the from clause via the use of the as clause

```sql
--Find the customer names and their loan numbers for all customers having a loan at some branch
select customer_name, T.loan_number, S.amount
from borrower as T, loan as S
where T.loan_number = S.loan_number
```

### string operations

* string-matching operator
  * %: The % character matches any substring
  * _: The $\_$ character matches any character

* **like / not like**: operator for pattern matching, e.g.

    ```sql
    --Find the names of all customers whose street includes (or not) the substring “Main”
    select customer_name
    from customer
    where customer_street like '%Main%'
    ```

* string operations
  * concatenation  using "||"
  * converting from upper to lower case (and vice versa)
  * finding string length,extracting substrings, etc.

#### Order the Display of Tuples

* list in alphabetic order

    ```sql
    select distinct customer_name
    from borrower, loan
    where borrower.loan_number = loan.loan_number and branch_name = 'Perryridge'
    order by customer_name
    ```

* **desc** for descending order,**asc** for ascending order. **asc** is the default

    ```sql
    select * 
    from loan
    order by amount desc, loan-number asc
    ```

#### Where Clause Predicates

* **between** and **not between** comparison operator

* tuple comparison

    ```sql
    select name, course_id
    from instructor, teaches
    where (instructor.ID, dept_name) = (teaches.ID, 'Biology');

    --equivalent expression
    select name, course_id
    from instructor, teaches
    where instructor.ID=teaches.ID and dept_name='Biology'
    ```

## Set Operations

* the **union, intersect, except** operations automatically eliminates duplicates
* To retain all duplicates, use **union all, intersect all, except all**
  * Suppose a tuple occurs **m** times in **r**, **n** times in **s**, then it occurs:
    * **m+n** times in `r union all s`
    * **min(m,n)** times in `r intersect all s`
    * **max(0,m-n)** times in `r except all s`

```sql
--Find all customers who have a loan, an account, or both:
(select customer_name from depositor)
union [all]
(select customer_name from borrower)
--Find all customers who have both a loan and an account.
(select customer_name from depositor)
intersect [all]
(select customer_name from borrower)
--Find all customers who have an account but no loan.
(select customer_name from depositor)
except [all]
(select customer_name from borrower)
```

## Null Values

* **null** signifies an unknown value or value doesn't exist
* the predicate **is null** is used to check null values
* aggregate functions simply ignore null values
* any arithmetic expression involving null is null
  * 5 + null = null
* any comparison with null returns unknown
  * 5 < null null <> null
* three-valued logic using the truth value unknown:
  * **OR**: (unknown or true) = true, (unknown or false) = unknown, (unknown or unknown) = unknown
  * **AND**: (true and unknown) = unknown, (false and unknown) = false, (unknown and unknown) = unknown
  * **NOT**: (not unknown) = unknown
* Result of where clause predicate is treated as false if it evaluates to **unknown**

* All aggregate operations except **count(*)** ignore tuples with null values on the aggregated attributes

## Aggregate Functions

– **avg**: average value
– **min**: minimum value
– **max**: maximum value
– **sum**: sum of values
– **count**: number of values

```sql
--Find the average account balance at the Perryridge branch
select avg (balance)
from account
where branch_name = 'Perryridge'

--Find the number of tuples in the customer relation
select count (*)
from customer

--Find the number of depositors in the bank
select count (distinct customer_name)
from depositor
```

* group by

    ```sql
    -- Find the number of depositors for each branch
    select branch_name, count (distinct customer_name)
    from depositor, account
    where depositor.account_number = account.account_number
    group by branch_name
    ```

* Note: Attributes in select clause outside of aggregate functions must appear in group by list

* having clause: state a condition that applies to groups rather than to tuples

    ```sql
    --find the names of all branches where the average account balance is more than $1,200.
    select branch_name, avg (balance)
    from account
    group by branch_name
    having avg (balance) > 1200
    ```

* note:
  * predicates in the **having** clause are applied **after** the information of groups whereas
  * predicates in the **where** clause are applied **before** forming groups

    ```sql
    --find the average balance for each customer who lives in Harrison and has at least three accounts
    select depositor.customer_name, avg (balance)
    from depositor, account, customer
    where depositor.account_number=account.account_number
    and depositer.customer_name=customer.customer_name
    and customer_city='Harrison'
    group by depositor.customer_name
    having count(distinct depositor.account_number) >= 3
    ```

## Nested Subqueries

* A subquery is a **select-from-where** expression that is **nested within another query** in the from clause

* A common use of subqueries is to perform
– tests for set membership
– make set comparisons
– determine set cardinality

### Set Membership

```sql
--Find all customers who have both an account and a loan at the bank
select distinct customer_name
from borrower
where customer_name in (select customer_name
from depositor)

--Find all customers who have a loan but do not have an account at the bank
select distinct customer_name
from borrower
where customer_name not in (select customer_name
from depositor)
```

### Set Comparison

```sql
--Find all branches that have greater assets than some branch located in Brooklyn
select distinct T.branch_name
from branch as T, branch as S
where T.assets > S.assets and S.branch_city = 'Brooklyn'

--Same query using >some clause
select branch_name
from branch
where assets > some
(select assets
from branch
where branch_city = 'Brooklyn')
```

#### some clause

* $F<comp> some~r \iff \exists t \in r ，such ~ that (F<comp>t),where<comp> can ~ be:<,
\leq,>,\geq,=,\neq$

#### all clause

* $F<comp> all~r \iff \forall t \in r， (F<comp>t)$

```sql
--Find the names of all branches that have greater assets than all branches located in Brooklyn.
select branch_name
from branch
where assets > all
(select assets
from branch
where branch_city = 'Brooklyn')
```

### Test for Empty Relations

* The exists construct returns the value TRUE if the argument subquery is nonempty
– exists 𝒓 ⇔ 𝒓 ≠ ∅
– not exists 𝒓 ⇔ 𝒓 = ∅

    ```sql
    -- find all customers who have both an account & a loan at the bank
    select customer_name
    from borrower
    where exists (
    select *
    from depositor
    where depositor.customer_name = borrower.customer_name)
    ```

```sql
--Find all customers who have both an account and a loan at the bank

--1
select customer_name
from borrower
where exists (
    select *
    from depositor
    where depositor.customer_name = borrower.customer_name)

--2
select distinct customer_name
from borrower
where customer_name in (select customer_name
                        from depositor)

--3
select distinct customer_name
from borrower, loan
where borrower.loan_number = loan.loan_number and (branch_name, customer_name) in
    (select branch_name, customer_name
    from depositor, account
    where depositor.account_number = account.account_number)
```

```sql
--Find all customers who have accounts at all branches located in Brooklyn
select distinct S.customer_name
from depositor as S
where not exists (
(select branch_name /* all branches in Brooklyn X */ 
from branch
where branch_city = 'Brooklyn')
except
(select R.branch_name /* finds all the branches at which customer 
S.customer_name has an account Y */ 
from depositor as T, account as R
where T.account_number = R.account_number and
S.customer_name = T.customer_name))
```

* Note: $not ~ exists(X-Y) \iff X-Y = \emptyset \iff X \subseteq Y$

* Write "relation A contains relation B" as "**not exists (B except A)**."

    ```sql
    --find all students who have taken all courses offered by the Biology department 
    select distinct S.ID, S.name
    from student as S
    where not exists ((select course_id
    from course
    where dept_name = 'Biology')
    except
    (select T.course_id
    from takes as T
    where S.ID=T.ID))
    ```

### Test for Absence of Duplicate Tuples

* The **unique** construct tests whether a subquery has any duplicate tuples in its result

    ```sql
    --find all customers who have at most one account at the Perryridge branch
    select T.customer_name
    from depositor as T
    where unique (
    select R.customer_name
    from account, depositor as R
    where T.customer_name = R.customer_name and
    R.account_number = account.account_number and
    account.branch_name = 'Perryridge')

    --Find all customers who have at least two accounts at the Perryridge branch. 
    select distinct T.customer_name
    from depositor T
    where not unique(
    select R.customer_name
    from account, depositor as R
    where T.customer-name = R.customer_name and
    R.account-number = account.account_number and
    account.branch_name = 'Perryridge')
    ```

### Views

* In some cases, it is not desirable for all users to see the entire logical model (that is, all the actual relations stored in the database.)

* Consider a person who needs to know a customer's name, loan number and branch name, but has no need to see the loan amount. This person should see a relation described by

    ```sql
    (select customer_name, borrower.loan_number, branch_name
    from borrower, loan
    where borrower.loan_number = loan.loan_number )
    ```

* A **view** provides a mechanism to hide certain data from the view of certain users. Any relation that is not of the conceptual model but is made visible to a user as a “**virtual relation**” is called a **view**.

#### view definition

```sql
--A view consisting of branches and their customers
create view all_customer as
(select branch_name, customer_name
from depositor, account
where depositor.account_number = account.account_number)
union
(select branch_name, customer_name
from borrower, loan
where borrower.loan_number = loan.loan_number)

--Find all customers of the Perryridge branch
select customer_name
from all_customer
where branch_name = 'Perryridge'
```

#### derived relations

```sql
select branch_name, avg (balance)
from account
group by branch_name
having avg (balance) > 1200

--equivalent
select branch_name, avg_balance
from (select branch_name, avg (balance)
    from account
    group by branch_name)
    as result (branch_name, avg_balance)
where avg_balance > 1200
```

* Note: we do not need to use the having clause, since we compute **the temporary (view) relation result in the from clause**, and the attributes of result can be used directly in the where clause

```sql
--Find the maximum total balance across all branches
select max(tot_balance)
from (select branch_name, sum (balance)
from account
group by branch_name)
as branch_total (branch_name, tot_balance)
```

#### with clauses

* **With** clause allows **views** to be defined **locally** to a query, rather than globally. Analogous to procedures in a programming language

```sql
--Find all accounts with the maximum balance. 
with max_balance(value) as
select max(balance)
from account

select account_number
from account, max_balance
where account.balance = max_balance.value
```

***With clause** is used in some complex queries*

#### scalar subquery

* Scalar subquery(标量子查询) is used where a single value is expected

```sql
--List all departments along with the number of instructors in each department
select dept_name, 
(select count(*) 
from instructor 
where department.dept_name = instructor.dept_name)
as num_instructors
from department;
```

## Modification of the Database

### Deletion

```sql
-- Delete all accounts at every branch located in Needham city
delete from account
where branch_name in (select branch_name
from branch
where branch_city = 'Needham')

--Delete the records of all accounts with balances below the 
average at the bank
delete from account
where balance < (select avg(balance)
from account)
```

* Note: as we delete tuples from account, **the average balance changes**

* Solution used in SQL:
  * First, compute avg balance and find all tuples to delete
  * Next, delete all tuples found above (without recomputing avg or retesting the tuples)

### Insertion

```sql
--Add a new tuple to account
insert into account
values ('A-9732', 'Perryridge',1200)

--or equivalently
insert into account (branch_name, balance, account_number)
values ('Perryridge', 1200, 'A-9732')

--Add a new tuple to account with balance setting to null
insert into account
values ('A-777','Perryridge', null)

--Provide as a gift for all loan customers of the Perryridge branch, i.e., a $200 saving account. Let the loan number serve as the account number for the new saving account
insert into account
select loan_number, branch_name, 200
from loan
where branch_name = 'Perryridge'
insert into depositor
select customer_name, loan_number
from loan, borrower
where loan.loan_number = borrower.loan_number
and branch_name = 'Perryridge'
```

* Note: The **select from where** statement is fully evaluated before any of its results are inserted into the relation. Otherwise, queries like **insert into table1 select * from table2** would cause problems

### Updates

```sql
/*Increase all accounts with balances over $10,000 by 6%, 
and all other accounts receive an increase of 5%.
– Write two update statements:*/
update account
set balance = balance ∗ 1.06
where balance > 10000
update account
set balance = balance ∗ 1.05
where balance <= 10000
```

* The order is important!
* can be done better using the case statement

```sql
update account
set balance = case
when balance <= 10000 then balance * 1.05
else balance * 1.06
end
```
