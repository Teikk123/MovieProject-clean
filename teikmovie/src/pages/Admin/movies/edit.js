import styles from './Movies.module.scss';
import classNames from 'classnames/bind';
import { Col, Form, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Select from 'react-select'; // ✅ import react-select

import { editMovie } from '~/apiService/movie';
import { getAll } from '~/apiService/genres';
import requestApi from '~/apiService';
import { AuthContext } from '~/context';
import { Img } from '~/apiService/instance';

const cs = classNames.bind(styles);

const EditMovie = () => {
    const { slug } = useParams();
    const [isTvShow, setIsTvShow] = useState(false);
    const [genres, setGenres] = useState([]);
    const [movie, setMovie] = useState();
    const [backdrop, setBackdrop] = useState('');
    const [posTer, setPosTer] = useState('');

    const { showToastMessage } = useContext(AuthContext);
    const naviagte = useNavigate();

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        const getMovie = async () => {
            try {
                const result = await requestApi.getDetails(slug);
                if (result.success) {
                    setMovie(result.data);

                    if (Number.isInteger(result.data.genres[0])) {
                        result.data.genres = result.data.genres.map((genre) => genre.toString());
                    }
                    result.data.seasons = result.data.seasons ? result.data.seasons : 1;

                    reset(result.data);
                    setValue('genres', result.data.genres); // ✅ sync với react-hook-form
                }
            } catch (error) {
                console.log(error);
            }
        };
        getMovie();
    }, [slug]);

    const Onsubmit = async (data) => {
        data.ibmPoints = Number(data.ibmPoints);
        data.episodes = Number(data.episodes);
        if (posTer) {
            data.poster_path = posTer;
        }
        if (backdrop) {
            data.backdrop_path = backdrop;
        }
        try {
            const res = await editMovie(data, movie._id);
            naviagte(-1);
            showToastMessage('success', res.message);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChangeCate = (e) => {
        if (e.target.value == 'tv') {
            setIsTvShow(true);
        } else {
            setIsTvShow(false);
        }
    };

    useEffect(() => {
        const getGenres = async () => {
            try {
                const res = await getAll();
                setGenres(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        getGenres();
    }, []);

    // ✅ Upload ảnh lên Cloudinary
    const handleUploadImg = async (e) => {
        const image = e.target.files[0];
        if (!image) return;

        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'MovieWeb'); // đổi preset trong Cloudinary

        try {
            const res = await fetch(
                'https://api.cloudinary.com/v1_1/dh5gvbozr/image/upload', // đổi CLOUD_NAME
                {
                    method: 'POST',
                    body: formData,
                }
            );
            const data = await res.json();
            if (e.target.id === 'backDrop') {
                setBackdrop(data.secure_url);
            } else {
                setPosTer(data.secure_url);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    return (
        <div className={cs('movie')}>
            <h3 className="text-center mb-3 fs-1 fw-bold">Sửa phim</h3>
            {movie && (
                <Form className={cs('movie_form')} onSubmit={handleSubmit(Onsubmit)}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên phim</Form.Label>
                                <Form.Control required type="text" {...register('name')} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Link trailer</Form.Label>
                                <Form.Control required type="text" {...register('trailerCode')} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Danh mục</Form.Label>
                                <Form.Select {...register('category')} onChange={handleChangeCate}>
                                    <option value="movie">Phim Lẻ</option>
                                    <option value="tv">Phim Bộ</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {(isTvShow || movie.category === 'tv') && (
                            <>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phần</Form.Label>
                                        <Form.Control required type="number" {...register('seasons')} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Số tập phim</Form.Label>
                                        <Form.Control required type="number" {...register('episodes')} />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Thể loại</Form.Label>
                                <Select
                                    isMulti
                                    classNamePrefix="select"
                                    options={genres.map((g) => ({ value: g.id.toString(), label: g.name }))}
                                    defaultValue={
                                        movie?.genres?.map((id) => {
                                            const g = genres.find((gg) => gg.id.toString() === id);
                                            return g ? { value: g.id.toString(), label: g.name } : null;
                                        }).filter(Boolean)
                                    }
                                    onChange={(selected) =>
                                        setValue('genres', selected.map((opt) => opt.value))
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Quốc gia</Form.Label>
                                <Form.Control required type="text" {...register('country')} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Id url phim</Form.Label>
                                <Form.Control required type="text" {...register('id')} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Giới Thiệu phim</Form.Label>
                                <Form.Control required as="textarea" type="text" {...register('overview')} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Ngày phát hành</Form.Label>
                                <Form.Control required type="date" {...register('releaseDate')} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Điểm đánh giá</Form.Label>
                                <Form.Control required type="text" {...register('ibmPoints')} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh nền</Form.Label>
                                <img
                                    className={cs('movie_backdrop_path')}
                                    src={backdrop || Img.baseImg(movie.backdrop_path)}
                                    alt=""
                                />
                                <Form.Control
                                    className="mt-4"
                                    id="backDrop"
                                    type="file"
                                    style={{ border: 'none' }}
                                    onChange={handleUploadImg}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh đại diện</Form.Label>
                                <img
                                    className={cs('movie_poster_path')}
                                    src={posTer || Img.posterImg(movie.poster_path)}
                                    alt=""
                                />
                                <Form.Control
                                    className="mt-4"
                                    type="file"
                                    style={{ border: 'none' }}
                                    onChange={handleUploadImg}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <button type="submit" className={cs('movie_btn_submit')}>
                        Cập nhập phim
                    </button>
                </Form>
            )}
        </div>
    );
};

export default EditMovie;
