<?php
declare(strict_types=1);

namespace OCA\MapToPoster\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

class PageController extends Controller {
    public function __construct(
        IRequest $request,
        private IURLGenerator $urls,
        private string $userId,
    ) {
        parent::__construct('maptoposter', $request);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function index(): TemplateResponse {
        $response = new TemplateResponse('maptoposter', 'main', [
            'davFolder' => $this->urls->getWebroot() . '/remote.php/dav/files/' . rawurlencode($this->userId) . '/Poster',
            'folderUrl' => $this->urls->linkToRoute('files.view.index', ['dir' => '/Poster']),
            'fileUrl' => $this->urls->linkToRoute('files.view.showFile', ['fileid' => '__FILE_ID__']),
        ]);

        $policy = new ContentSecurityPolicy();
        foreach (['https://tile.openstreetmap.org', 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com'] as $tiles) {
            $policy->addAllowedImageDomain($tiles);
            $policy->addAllowedConnectDomain($tiles);
        }
        $policy->addAllowedConnectDomain('https://nominatim.openstreetmap.org');
        $policy->addAllowedConnectDomain('https://router.project-osrm.org');
        $policy->addAllowedConnectDomain('https://tiles.openfreemap.org');
        $policy->addAllowedImageDomain('blob:');
        $policy->addAllowedWorkerSrcDomain('blob:');
        $response->setContentSecurityPolicy($policy);
        return $response;
    }
}
