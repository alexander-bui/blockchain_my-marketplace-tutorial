pragma solidity ^0.5.0;

contract Marketplace {
  struct Product {
    uint id;
    string name;
    uint price;
    address payable owner;
    bool purchased;
  }

  mapping(uint => Product) public products;
  uint public productCount = 0;
  string public name;

  constructor() public {
    name = "Blockchain Marketplace";
  }

  event ProductCreated(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
  );

  event ProductPurchased(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased
  );

  function createProduct(string memory _name, uint _price) public {
    require(bytes(_name).length > 0);
    require(_price > 0);
    productCount++;
    // Create Product then Trigger event
    products[productCount] = Product(productCount, _name, _price, msg.sender, false);
    emit ProductCreated(productCount, _name, _price, msg.sender, false);
  }

  function purchaseProduct(uint _id) public payable {
    // Get Product via mapping
    Product memory _product = products[_id];
    // Get Owner
    address payable _seller = _product.owner;
    // Product has valid id
    require(_product.id > 0 && _product.id <= productCount);
    // There is enough Ether in the txn
    require(msg.value >= _product.price);
    // Product not purchased already
    require(!_product.purchased);
    // Buyer is not the seller
    require(_seller != msg.sender);
    // Transfer ownership to buyer
    _product.owner = msg.sender;
    // Mark as purchased
    _product.purchased = true;
    // Update product
    products[_id] = _product;
    // Pay seller by sending them Ether
    address(_seller).transfer(msg.value);
    // Product Purchased Tigger Event
    emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
  }

}
