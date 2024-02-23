import React, { useState, useEffect } from 'react';
import { MD5 } from 'crypto-js';
import { Product } from '../components/Product';
import { Pagination } from '../components/Pagination';

// URL и данные аутентификации для API
const apiUrl = 'http://api.valantis.store:40000/';
const password = 'Valantis';

// Функция для генерации строки аутентификации на основе временной метки и пароля
const generateAuthString = () => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const authKey = MD5(`${password}_${timestamp}`);
    return authKey;
}

// Функция для получения данных из API
const fetchData = async (action, params = {}) => {
    try {
        const authString = generateAuthString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth': authString
            },
            body: JSON.stringify({ action, params })
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении данных');
        }

        const data = await response.json();
        return data.result;
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        throw error;
    }
};

export const Main = () => {
    // Состояния компонента
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({});

    // Получение данных при загрузке компонента
    useEffect(() => {
        const fetchDataAsync = async () => {
            try {
                // Получение идентификаторов продуктов, затем получение данных о продуктах
                const productIds = await fetchData('get_ids');
                const productsData = await fetchData('get_items', { ids: productIds });
                // Удаление дубликатов продуктов
                const uniqueProducts = getUniqueProducts(productsData);
                setProducts(uniqueProducts);
            } catch (error) {
                setError('Ошибка при получении данных. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchDataAsync();
    }, []);

    // Обработчик пагинации
    const handlePaginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Обработчик изменения значений фильтра
    const handleFilterChange = (type, value) => {
        setFilter({ ...filter, [type]: value });
    };

    // Обработчик сброса фильтров и повторного получения всех продуктов
    const handleResetFilters = async () => {
        setFilter({});
        setLoading(true);

        try {
            const productIds = await fetchData('get_ids');
            const productsData = await fetchData('get_items', { ids: productIds });
            const uniqueProducts = getUniqueProducts(productsData);
            setProducts(uniqueProducts);
        } catch (error) {
            setError('Ошибка при получении данных. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Применение фильтров и получение отфильтрованных продуктов
    const applyFilters = () => {
        const { name, price, brand } = filter;
        const params = {};

        if (name) params.product = name;
        if (price) params.price = parseFloat(price);
        if (brand) params.brand = brand;

        fetchDataFiltered(params);
    };

    // Получение отфильтрованных продуктов на основе параметров фильтрации
    const fetchDataFiltered = async (params) => {
        try {
            const productIds = await fetchData('filter', params);
            const productsData = await fetchData('get_items', { ids: productIds });
            const uniqueProducts = getUniqueProducts(productsData);
            setProducts(uniqueProducts);
        } catch (error) {
            setError('Ошибка при получении данных. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Функция для удаления дубликатов продуктов на основе их идентификаторов
    const getUniqueProducts = (productsData) => {
        const uniqueProducts = [];
        const uniqueProductIds = new Set();

        productsData.forEach((product) => {
            if (!uniqueProductIds.has(product.id)) {
                uniqueProductIds.add(product.id);
                uniqueProducts.push(product);
            }
        });

        return uniqueProducts;
    };

    // Функция для отрисовки списка продуктов
    const renderProducts = () => {
        const itemsPerPage = 50;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const displayedProducts = products.slice(startIndex, endIndex);

        return displayedProducts.map((product) => (
            <Product key={product.id} product={product} />
        ));
    };

    return (
        <main>
            {loading ? (
                <p>Загрузка...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <h1>Найдено товаров: {products.length}</h1>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(products.length / 50)}
                        onPaginate={handlePaginate}
                    />

                    <div className="filter-section">
                        <h2>Отфильровать</h2>
                        <input
                            type="text"
                            placeholder="По названию"
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="По цене"
                            onChange={(e) => handleFilterChange('price', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="По бренду"
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        />
                        <button onClick={applyFilters}>Применить фильтры</button>
                        <button onClick={handleResetFilters}>Сбросить фильтры</button>
                    </div>
                    <ul className='product-list'>
                        {renderProducts()}
                    </ul>
                </>
            )}
        </main>
    );
};
