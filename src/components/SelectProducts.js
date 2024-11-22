

import { Button, Input, ScrollArea } from "@mantine/core";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { Search, UserCircle } from "tabler-icons-react";

const SelectProducts = ({ products, setProducts, setOpenModel }) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState({});
    const [selectedRawData, setSelectedRawData] = useState({});
    const [allProducts, setAllProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        console.log("env", process.env.REACT_APP_API_KEY);

        const fetchProductsApi = async () => {
            if (loading) return;
            setLoading(true);

            try {
                const response = await axios.get(process.env.REACT_APP_API_URL, {
                    headers: {
                        "x-api-key": process.env.REACT_APP_API_KEY
                    },
                    params: {
                        search: searchTerm || undefined,
                        page: page,
                        limit: 5,
                    },
                });

                const products = Array.isArray(response?.data) ? response.data : [];

                setAllProducts((prev) => [...(Array.isArray(prev) ? prev : []), ...products]);
                setFilteredProducts((prev) => [...(Array.isArray(prev) ? prev : []), ...products]);


            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsApi();
    }, [searchTerm, page]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
        setFilteredProducts([]);
    };

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const handleScroll = debounce(() => {
        const bottom = Math.ceil(containerRef.current.scrollTop + containerRef.current.clientHeight) >= containerRef.current.scrollHeight;

        if (bottom && !loading) {
            setPage((prev) => prev + 1);
        }
    }, 300);

    const toggleParent = (productId) => {
        setSelectedProducts((prevState) => {
            const isParentSelected = prevState[productId]?.parentSelected || false;
            const variants = allProducts?.find((product) => product.id === productId)?.variants || [];
            const updatedState = {
                ...prevState,
                [productId]: {
                    parentSelected: !isParentSelected,
                    variantsSelected: isParentSelected ? [] : variants.map((v) => v.id),
                },
            };

            saveSelectedData(updatedState);
            return updatedState;
        });
    };

    const toggleVariant = (productId, variantId) => {
        setSelectedProducts((prevState) => {
            const productState = prevState[productId] || { parentSelected: false, variantsSelected: [] };
            const isVariantSelected = productState.variantsSelected.includes(variantId);

            const updatedVariants = isVariantSelected
                ? productState.variantsSelected.filter((id) => id !== variantId)
                : [...productState.variantsSelected, variantId];

            const isParentSelected = updatedVariants?.length === allProducts.find((p) => p.id === productId).variants?.length;
            const isSomeVariantsSelected = updatedVariants?.length > 0 && updatedVariants?.length < allProducts.find((p) => p.id === productId).variants?.length;

            const updatedState = {
                ...prevState,
                [productId]: {
                    parentSelected: isParentSelected,
                    variantsSelected: updatedVariants,
                    parentIndeterminate: isSomeVariantsSelected,
                },
            };

            saveSelectedData(updatedState);

            return updatedState;
        });
    };

    const saveSelectedData = (updatedState) => {
        const selectedData = Object.keys(updatedState)
            .filter((productId) => updatedState[productId].variantsSelected?.length > 0)
            .map((productId) => {
                const product = allProducts.find((p) => p.id === parseInt(productId));
                const selectedVariants = updatedState[productId].variantsSelected;
                const variants = product?.variants?.filter((variant) => selectedVariants.includes(variant?.id));

                return {
                    productId: product?.id,
                    title: product?.title,
                    selectedVariants: variants,
                };
            });

        setSelectedRawData(selectedData);
    };

    const onCancel = () => {
        setProducts({});
        setOpenModel(false);
    };

    const onAdd = () => {
        setProducts(selectedRawData);
        setOpenModel(false);
    };

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (currentContainer) {
            currentContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);
    return (
        <div className="container mx-auto">
            <div className="border-y border-gray-200 border-solid py-2 flex justify-between gap-4">
                <Input
                    leftSection={<Search
                        size={20}
                        strokeWidth={2}
                        color={'gray'}
                        className="ml-4"
                    />}
                    placeholder="Search Products"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="p-2 w-full"
                />
            </div>

            <ScrollArea
                viewportRef={(ref) => {
                    containerRef.current = ref;
                }}
                h={380}
                onScroll={handleScroll}
            >
                {filteredProducts?.length > 0 ? (
                    filteredProducts.map((product, index) => {
                        const productState = selectedProducts[product.id] || { parentSelected: false, variantsSelected: [] };

                        return (
                            <div key={product.id} className="p-0">
                                <div className={`flex ${index === 0 ? "border-b" : "border-y"} border-gray-200 items-center py-3`}>
                                    <label className={`${productState.parentIndeterminate && 'label-checkBox-indeterminate'} label-checkBox `}>
                                        <input
                                            type="checkbox"
                                            checked={productState.parentSelected}
                                            ref={(el) => el && (el.indeterminate = productState.parentIndeterminate)}
                                            onChange={() => toggleParent(product.id)}
                                            className="mr-4 h-5 w-5 hidden"
                                        />
                                        <span className="mr-4 h-5 w-5 border border-solid border-gray-500 rounded-sm inline-block">{productState.parentIndeterminate ? '-' : '✓'}</span>
                                    </label>
                                    {product?.image?.src ?
                                        <img
                                            src={product.image.src}
                                            alt="No img"
                                            className="w-10 mr-3 object-cover rounded-md"
                                        /> :
                                        <UserCircle
                                            size={30}
                                            strokeWidth={2}
                                            color={'black'}
                                            className="mr-3"
                                        />}
                                    <h3 className="font-normal text-base flex items-center">
                                        {product.title}
                                    </h3>
                                </div>
                                <p className="text-gray-800 mt-1 !p-0">
                                    {product.variants?.length > 0 && (
                                        <div className="divide-y-0">
                                            {product.variants.map((variant) => (
                                                <div key={variant.id} className="flex pl-20 text-base font-normal p-4 py-3 items-center">
                                                    <label className="label-checkBox">
                                                        <input
                                                            type="checkbox"
                                                            checked={productState.variantsSelected.includes(variant.id)}
                                                            onChange={() => toggleVariant(product.id, variant.id)}
                                                            className="mr-4 w-5 h-5 hidden"
                                                        />
                                                        <span className="mr-4 h-5 w-5 border border-solid border-gray-500 rounded-sm inline-block">✓</span>

                                                    </label>
                                                    <div className="overflow-hidden overflow-ellipsis whitespace-nowrap w-[200px]">{variant.title}</div>
                                                    <div className="flex gap-10 ml-auto">
                                                        <div>{variant.available ? `${variant.available} available` : "-"}</div>
                                                        <div className="min-w-[60px] text-right">${variant.price}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <div>No products found</div>
                )}
            </ScrollArea>


            <div className="mt-4 flex justify-between">
                {selectedRawData?.length > 0 && (
                    <h1>{selectedRawData?.length} Selected Products</h1>
                )}
                <div className="flex gap-2 ml-auto">
                    <Button variant="outline" color="gray" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button className="btn-design" color="teal" style={{ background: '#008060' }} onClick={onAdd}>
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SelectProducts;

