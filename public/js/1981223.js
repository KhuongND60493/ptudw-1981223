'use strict';

async function addCart(id, quantity) {
  let res = await fetch('/products/cart', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({id, quantity}),
  });
  let json = await res.json();
  document.getElementById('cartQuantity').innerText = `(${json.quantity})`;
}

async function updateCart(id, quantity) {
  if (quantity > 0) {
    let res = await fetch('/products/cart', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({id, quantity}),
    });
    if (res.status == 200) {
      let json = await res.json();
      document.getElementById('cartQuantity').innerText = `(${json.quantity})`;
      document.getElementById('cartSubtotal').innerText = `$${json.subtotal}`;
      document.getElementById('cartTotal').innerText = `$${json.total}`;
      document.getElementById(`cartTotal${id}`).innerText = `$${json.item.total}`;
    }
  } else {
    await removeCart(id);
  }
}

async function removeCart(id) {
  if (confirm('Do you really want to remove this product?')) {
    let res = await fetch('/products/cart', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({id}),
    });
    if (res.status == 200) {
      let json = await res.json();
      document.getElementById('cartQuantity').innerText = `(${json.quantity})`;
      if (json.quantity > 0) {
        document.getElementById('cartSubtotal').innerText = `$${json.subtotal}`;
        document.getElementById('cartTotal').innerText = `$${json.total}`;
        document.getElementById(`cartRow${id}`).remove();
      } else {
        document.querySelector('.cart-page .container').innerHTML =
          ' <div class="text-center border py-3 my-3">  Your cart is empty!  </div>';
      }
    }
  }
}

async function clearCart() {
  if (confirm('Do you really want to remove clear your cart?')) {
    let res = await fetch('/products/cart/all', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    });
    if (res.status == 200) {
      document.getElementById('cartQuantity').innerText = `(0)`;
      document.querySelector('.cart-page .container').innerHTML =
        ' <div class="text-center border py-3 my-3">  Your cart is empty!  </div>';
    }
  }
}

function placeorders(e) {
  e.preventDefault();
  const addressId = document.querySelector('input[name=addressId]:checked');
  if (!addressId || addressId.value == 0) {
    if (!e.target.checkValidity()) {
      return e.target.reportValidity();
    }
  }
  e.target.submit();
}
