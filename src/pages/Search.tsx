import React, { useState } from 'react'
import ProductCard from '../components/product-card';
import { useCategoriesQuery, useSearchProductsQuery } from '../redux/api/productAPI';
import { CustomError } from '../types/api-types';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/Loader';
import { CartItemTypes } from '../types/types';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/reducer/cartReducer';

const Search = () => {
  const { data: categoriesResponse, isLoading: lodingCategories, isError, error } = useCategoriesQuery("")
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const { isLoading: productLoading, data: searchedData, isError:productIsError, error:productError } = useSearchProductsQuery({ search, price: maxPrice, page, sort, category })
  const isNextPage = page > 1;
  const isPrevPage = page < 4;
  const dispatch = useDispatch()
  const addToCartHandler = (cartItem: CartItemTypes) => { 
    if(cartItem.stock<1) return toast.error('Out of Stock');
    dispatch(addToCart(cartItem));
    toast.success("Added to cart")
  }

  if (isError) {
    const err = error as CustomError;
    toast.error(err.data.message)
  }
  if (productIsError) {
    const err = productError as CustomError;
    toast.error(err.data.message)
  }


  return (
    <div className='product-search-page'>
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)} >
            <option value="">None</option>
            <option value="asc">Price (Low to High)</option>
            <option value="desc">Price(High to Low)</option>
          </select>
        </div>
        <div>
          <h4>Max Price: {maxPrice || ""}</h4>
          <input type='range' value={maxPrice} min={100} max={100000} onChange={(e) => setMaxPrice(Number(e.target.value))} />

        </div>

        <div>
          <h4>Category</h4>
          <select value={category} onChange={(e) => setCategory(e.target.value)} >
            <option value="">All</option>
            {
              (lodingCategories === false) && categoriesResponse?.categories.map(i => (<option key={i} value={i}>{i.toUpperCase()}</option>))
            }

          </select>
        </div>

      </aside>
      <main>
        <h1>Products</h1>
        <input type="text" placeholder='search by name...' value={search} onChange={(e) => setSearch(e.target.value)} />
        {
          productLoading ? <Skeleton length={10} /> : (
            <div className="searc-product-list">
              {
                searchedData?.products.map(i => (
                  <ProductCard
                    key={i._id}
                    productId={i._id}
                    price={i.price}
                    name={i.name}
                    photo={i.photo}
                    stock={i.stock}
                    handler={addToCartHandler}
                  />
                ))
              }
            </div>
          )
        }
        {
          searchedData && searchedData?.totalPage > 1 && (
            <article>
              <button onClick={() => setPage(prev => prev - 1)} disabled={isPrevPage}>Prev</button>
              <span>{page} of {searchedData.totalPage}</span>
              <button onClick={() => setPage(prev => prev + 1)} disabled={isNextPage}>Next</button>
            </article>
          )
        }
      </main>
    </div>
  )
}

export default Search