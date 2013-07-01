<?php

/*

type: layout
content_type: product
name: Product inner 
description: shop layout

*/



?>
<?php include THIS_TEMPLATE_DIR. "header.php"; ?>

<section id="content">
  <div class="container">
  <h2 class="edit main-title"  field="title" rel="post">Product inner page</h2>
    <div class="row">
      <div class="span9"> <!-------------- Product -------------->




        <div class="edit"  field="content" rel="post">
          <div class="mw-row">
            <div class="mw-col" style="width:50%">
            <div class="mw-col-container">
              <module type="pictures" rel="post" template="product_gallery" id="test1" />
            </div>
            </div>
            <div class="mw-col" style="width:50%">
            <div class="mw-col-container">
            <div class="product-description">
              <p class="element">This text is set by default and is suitable for edit in real time. By default the drag and drop core feature will allow you to position it anywhere on the site. Get creative &amp; <strong style="font-weight: 600">Make Web</strong>.</p>
              <module type="shop/cart_add" rel="post" />
            </div>
</div>
            </div>
          </div>
        </div>
        
        <!-------------- Related Products -------------->
        
        <h4 class="element sidebar-title">Related Products</h4>
        <div class="mw-columns-3">
            <module
                    data-type="shop/products"
                    related="true"
                    data-hide-paging="true"
                    data-limit="3"
                    data-show="thumbnail,title,add_to_cart,description,price"
                    data-template="mwcolumns" />
        </div>


        <p class="element">&nbsp;</p>
      </div>
      <!------------ Sidebar -------------->
      <div class="span3">
        <?php include_once ACTIVE_TEMPLATE_DIR. 'layouts' . DS."shop_sidebar_inner.php"; ?>
      </div>
    </div>
  </div>
</section>
<?php include THIS_TEMPLATE_DIR. "footer.php"; ?>
