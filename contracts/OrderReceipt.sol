// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrderReceipt {
    struct Receipt {
        uint256 orderId;
        string buyerHash;
        uint256 totalCents;
        uint256 itemCount;
        string orderHash;
        uint256 timestamp;
    }

    Receipt[] public receipts;

    event OrderPlaced(
        uint256 indexed orderId,
        string buyerHash,
        uint256 totalCents,
        uint256 itemCount,
        string orderHash,
        uint256 timestamp
    );

    function createReceipt(
        uint256 _orderId,
        string memory _buyerHash,
        uint256 _totalCents,
        uint256 _itemCount,
        string memory _orderHash
    ) public {
        uint256 currentTime = block.timestamp;

        receipts.push(
            Receipt(
                _orderId,
                _buyerHash,
                _totalCents,
                _itemCount,
                _orderHash,
                currentTime
            )
        );

        emit OrderPlaced(
            _orderId,
            _buyerHash,
            _totalCents,
            _itemCount,
            _orderHash,
            currentTime
        );
    }

    function getReceiptCount() public view returns (uint256) {
        return receipts.length;
    }
}