import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

const baseUrl = 'https://api-desafio-qa.onrender.com';

describe('Company API Integration Tests', () => {
    const p = pactum;
    const rep = SimpleReporter;
    p.request.setDefaultTimeout(30000);

    let companyId = '';

    it('get companies', async () => {
        const companyToDelete = await p
            .spec()
            .get(`${baseUrl}/company`)
            .expectStatus(StatusCodes.OK);
    });

    it('get company by id', async () => {
        await p
            .spec()
            .get(`${baseUrl}/company/?companyId=1`)
            .expectStatus(StatusCodes.OK);
    });

    it('delete company', async () => {
        await p
            .spec()
            .delete(`${baseUrl}/company/?companyId=1`)
            .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('new company', async () => {
        const createdCompany = await p
            .spec()
            .post(`${baseUrl}/company`)
            .withJson({
                name: faker.company.name(),
                cnpj: '19100000000000',
                state: faker.location.state(),
                city: faker.location.city(),
                address: faker.location.streetAddress(),
                sector: faker.commerce.department()
            })
            .expectStatus(StatusCodes.CREATED);
        companyId = createdCompany?.body?.id;
    });
    
    it('add new employee to company', async () => {
        expect(companyId).toBeTruthy();

        const newEmployee = {
            name: faker.name.fullName(),
            position: faker.name.jobTitle(),
            email: faker.internet.email()
        };

        await p
            .spec()
            .post(`${baseUrl}/company/${companyId}/employees`)
            .withJson(newEmployee)
            .expectStatus(StatusCodes.CREATED);
    });
    
    it('add new product to company', async () => {
        expect(companyId).toBeTruthy();

        const newProduct = {
            productName: faker.commerce.productName(),
            productDescription: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price())
        };
        console.log(newProduct);

        const response = await p
            .spec()
            .post(`${baseUrl}/company/${companyId}/products`)
            .withJson(newProduct)
            .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('add new service to company', async () => {
        expect(companyId).toBeTruthy();

        const newService = {
            serviceName: faker.commerce.productName(),
            serviceDescription: faker.commerce.productDescription()
        };

        const response = await p
            .spec()
            .post(`${baseUrl}/company/${companyId}/services`)
            .withJson(newService)
            .expectStatus(StatusCodes.CREATED);
    });

    it('should return 400 for invalid data', async () => {
        const response = await p
            .spec()
            .post(`${baseUrl}/company/${companyId}/services`)
            .withJson({
                // Dados inválidos
            })
            .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 for non-existent company and employee', async () => {
        const invalidCompanyId = 999999; // Um ID de empresa que não existe
        const invalidEmployeeId = 888888; // Um ID de funcionário que não existe

        const response = await p
            .spec()
            .delete(`${baseUrl}/company/${invalidCompanyId}/employees/${invalidEmployeeId}`)
            .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('should return 404 for non-existent company', async () => {
        const invalidCompanyId = 999999; // Um ID que não existe

        const response = await p
            .spec()
            .post(`${baseUrl}/company/${invalidCompanyId}/services`)
            .withJson({
                serviceName: faker.commerce.productName(),
                serviceDescription: faker.commerce.productDescription()
            })
            .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('should return 400 for invalid product data', async () => {
        const response = await p
            .spec()
            .post(`${baseUrl}/company/${companyId}/products`)
            .withJson({
                // Dados inválidos (exemplo vazio)
                productName: '',
                productDescription: '',
                price: -10 // Preço inválido
            })
            .expectStatus(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 for invalid data', async () => {
        const serviceId = 1;
        const response = await p
            .spec()
            .put(`${baseUrl}/company/${companyId}/services/${serviceId}`)
            .withJson({
                // Enviando dados inválidos
                serviceName: '',
                serviceDescription: ''
            })
            .expectStatus(StatusCodes.BAD_REQUEST);
    });
});
