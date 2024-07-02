# Relational Database Design Theory

## Features of Good Relational Designs

* design goals
  * avoid redudant data
  * ensure that relationships among attributes are represented
  * ensure no information loss
  * facilitate the checking of updates for violation of database integrity constraints

## Functional Dependency

### Why and what?

* consider the relation schema

    ```sql
    lending_schema = (branch_name, branch_city, assets, customer_name, loan_number, amount)
    ```

  * rebundancy
  * null values
    * cannot store information about a branch with no loan
    * can use null values, but difficult to handle

* decomposition
  * decompose the relation schema `lending_schema` into:

    ```sql
    branch_schema = (branch_name, branch_city, assets)
    loan_info_schema = (customer_name, loan_number, branch_name, amount)
    ```

  * all attributes of an original schema R must appear in the decomposition $(R_1,R_2):R = R_1\cup R_2$
  * lossless-join decomposition:
    * for all possible relations r on schema R: $r = \Pi_{R_1}(r)\bowtie\Pi_{R_2}(r)$

* goal: devise a theory for the following
  * decide whether a particular relation R is in good form
  * in the case when R is not a good form, decompose it into a set of relations $(R_1,R_2,R_3,...,R_n)$ such that
    * each relation is in good form
    * the decompostion is a lossless-join decomposition
    * the decomposition is dependency-preservation
  * our theory is based on:
    * functional dependency
    * multi-valued dependencies

* functional dependencies
  * constraints on the set of legal relations
  * require that the value for a certain set of attributes determines uniquely the value for another set of attributes
    * or a set of attributes are determined by another set of attributes
  * a functioinal dependency is a generalization of the notion of a key
    * or key is a specific form of functional dependency
  * K is a superkey for relation R iff $K\rightarrow R$
  * K is a candidate key iff $K\rightarrow R$, no $\alpha \subset K,\alpha\rightarrow R$

  * FDs allows us to express constraints that cannot be expressed using superkeys
  * a FD is trivial if it is satisfied if it is satisfied by all instances of a relation, e.g. $AB\rightarrow A$

  * full dependency and partially dependency
    * full: $\beta$ is fully dependent on $\alpha$, if there is no proper subset $\alpha'$ of $\alpha$ such that $\alpha' \rightarrow \beta$
    * partially: otherwise

### Closure of functional dependency

* given a set F of FDs, there are some other FDs that are logically implied by F
  * e.g. if $A\rightarrow B,B\rightarrow C$, then we can infer that $A\rightarrow C$
  * the set of all FDs logically implied by F is the closure of F
  * denote by $F^+$
* can find all of $F^+$ by applying **Armstrong's Axiom**:
  * $\beta\subseteq \alpha\Rightarrow\alpha\rightarrow \beta$ (reflexivity)
  * $\alpha\rightarrow\beta\Rightarrow\gamma\alpha\rightarrow\gamma\beta$ (augmentation)
  * $\alpha\rightarrow\beta,\beta\rightarrow\gamma\Rightarrow\alpha\rightarrow\gamma$ (transitivity)
* additional rules:
  * $\alpha\rightarrow \beta,\alpha\rightarrow\gamma\Rightarrow\alpha\rightarrow\beta\gamma$ (union)
  * $\alpha\rightarrow\beta\gamma\Rightarrow\alpha\rightarrow \beta,\alpha\rightarrow\gamma$ (decomposition)
  * $\alpha\rightarrow\beta,\gamma\beta\rightarrow\delta\Rightarrow\alpha\gamma\rightarrow\delta$ (pseudotransitivity)

### Closure of Attribute sets

* given a set of attributes $\alpha$, define the closure of $\alpha$ under F (denoted by $\alpha^+$) as the set of attributes that are functionally determined by $alpha$ under F:
$\alpha\rightarrow\beta$ is in $F^+$ $\Rightarrow \beta\subseteq\alpha^+$

* applications of attribute closure:
  * test for superkey
  * test functional dependencies
  * computing closure of F

### Canonical Cover

* sets of FDs may have redundant FDs that can be inferred from the others
* intuitively, a canonical cover of F is a  "minimal" set of FDs equivalent to F, having no redundant FDs or redundant parts of FDs
* extraneous attributes

* A canonical cover for F is a set of FDs 𝑭𝒄 such that
  * 𝐹 logically implies all dependencies in 𝐹𝑐
  , and
  * 𝐹𝑐 logically implies all dependencies in 𝐹, and
  * No FD in 𝐹𝑐 contains an extraneous attribute, and
  * Each left side of FD in 𝐹𝑐 is unique, i.e., there are no two FDs 𝛼1 → 𝛽1 and 𝛼2 → 𝛽2 such that 𝛼1 = 𝛼2

* To compute a canonical cover for 𝐹:
**repeat**
use the union rule to replace any dependencies in F
𝛼1 → 𝛽1 and 𝛼1 → 𝛽2 with 𝛼1 → 𝛽1 𝛽2
find a FD 𝛼 → 𝛽 with an extraneous attr. either in 𝛼 or in 𝛽
If an extraneous attr. is found, delete it from 𝛼 → 𝛽
**until** F does not change

### Lossless-join decomposition

* **theorem** A decomposition of R into $R_1$ and $R_2$ is lossless join iff:
$R_1\cap R_2\rightarrow R_1$, or $R_1\cap R_2\rightarrow R_2$

### Dependency Preservation

* When we decompose a relation schema 𝑹 with a set of FDs F into 𝑹𝟏, 𝑹𝟐,.., 𝑹𝒏 we want
* Lossless-join decomposition: Otherwise decomposition would result in information loss
* No redundancy: The relations 𝑹𝒊 preferably should be in either BCNF or 3NF
* Dependency preservation: Let 𝑭𝒊 be the subset of dependencies $F^+$ that include only attributes in 𝑹𝒊
• $(𝑭𝟏 ∪ 𝑭𝟐 ∪ ⋯ ∪ 𝑭𝒏)^+= 𝑭^+$
• Otherwise, checking updates for violation of FDs may require computing joins, which is expensive

## Normalization & Normal Forms

* 1NF: domains of all attributes of R is atomic(attributes do not have substructures)
* $2^{nd}$NF
  * 1NF
  * Every non-key attribute is fully functionally dependent on the **ENTIRE** primary key, i.e., no partial functional dependencies

* 3NF
  * 2NF
  * no transitive dependencies

* BCNF
  * given relation schema R and FDs F, R is BCNF if for every FD $\alpha\rightarrow\beta$ in $F^+$, at least one of the following holds:
    * $\alpha\rightarrow\beta$ is trivial
    * $\alpha$ is a superkey for R

* 3NF: motivation
  * there are some situations where
    * BCNF is not dependency preserving
    * efficient checking for FD violation on updates is important
  * solution: define a weaker normal form, i.e., 3NF
    * there is always a lossless-join, dependency-preserving decomposition into 3NF
  * a relation schema R is in 3NF if for all $\alpha\rightarrow\beta$:
    * trivial, or
    * $\alpha$ a superkey, or
    * each attribute A in $\beta-\alpha$ is contained in a candidate key for R
  * if a relation is in BCNF, it's in 3NF
  * decomposition algorithm
