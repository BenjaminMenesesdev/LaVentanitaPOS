<?php

$app = new class($_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)) extends Illuminate\Foundation\Application {
    public function configPath($path = '')
    {
        return $this->basePath . DIRECTORY_SEPARATOR . 'src/config' . ($path != '' ? DIRECTORY_SEPARATOR . $path : '');
    }
};

$app->useAppPath($app->basePath('src/app'));
$app->instance('path.config', $app->basePath('src/config'));
$app->useDatabasePath($app->basePath('src/database'));
$app->useLangPath($app->basePath('src/lang'));
$app->useStoragePath($app->basePath('src/storage'));

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

return $app;
